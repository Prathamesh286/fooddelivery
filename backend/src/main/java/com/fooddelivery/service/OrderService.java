package com.fooddelivery.service;

import com.fooddelivery.dto.OrderDto;
import com.fooddelivery.entity.*;
import com.fooddelivery.enums.OrderStatus;
import com.fooddelivery.enums.Role;
import com.fooddelivery.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service @RequiredArgsConstructor
public class OrderService {
    private final OrderRepository orderRepo;
    private final RestaurantRepository restaurantRepo;
    private final MenuItemRepository menuRepo;
    private final UserRepository userRepo;

    @Transactional
    public OrderDto.Response placeOrder(OrderDto.CreateRequest req, User customer) {
        Restaurant restaurant = restaurantRepo.findById(req.getRestaurantId()).orElseThrow(()->new RuntimeException("Restaurant not found"));
        List<OrderItem> items = new ArrayList<>();
        double subtotal = 0;

        Order order = Order.builder().customer(customer).restaurant(restaurant)
                .deliveryAddress(req.getDeliveryAddress()).paymentMethod(req.getPaymentMethod())
                .specialInstructions(req.getSpecialInstructions()).deliveryFee(restaurant.getDeliveryFee()).build();

        for (OrderDto.ItemRequest ir : req.getItems()) {
            MenuItem mi = menuRepo.findById(ir.getMenuItemId()).orElseThrow(()->new RuntimeException("Item not found"));
            double sub = mi.getPrice() * ir.getQuantity();
            subtotal += sub;
            items.add(OrderItem.builder().order(order).menuItem(mi).quantity(ir.getQuantity()).price(mi.getPrice()).subtotal(sub).build());
        }
        order.setOrderItems(items); order.setSubtotal(subtotal);
        order.setTotalAmount(subtotal + restaurant.getDeliveryFee());
        return toResp(orderRepo.save(order));
    }

    /** Owner confirms order + auto-assigns nearest available agent */
    @Transactional
    public OrderDto.Response confirmOrder(Long orderId, Long ownerId) {
        Order order = orderRepo.findById(orderId).orElseThrow();
        if (!order.getRestaurant().getOwner().getId().equals(ownerId)) throw new RuntimeException("Unauthorized");
        if (order.getStatus() != OrderStatus.PENDING) throw new RuntimeException("Order already processed");
        order.setStatus(OrderStatus.CONFIRMED);

        // Auto-assign available delivery agent
        List<User> agents = userRepo.findByRoleAndAvailableTrue(Role.DELIVERY_AGENT);
        if (!agents.isEmpty()) {
            // Pick agent with least active orders
            User bestAgent = agents.stream().min(
                Comparator.comparingLong(a -> orderRepo.countByDeliveryAgentIdAndStatus(a.getId(), OrderStatus.OUT_FOR_DELIVERY))
            ).orElse(agents.get(0));
            order.setDeliveryAgent(bestAgent);
            order.setAssignedAt(LocalDateTime.now());
        }
        return toResp(orderRepo.save(order));
    }

    /** Owner moves order to PREPARING */
    @Transactional
    public OrderDto.Response startPreparing(Long orderId, Long ownerId) {
        Order order = orderRepo.findById(orderId).orElseThrow();
        if (!order.getRestaurant().getOwner().getId().equals(ownerId)) throw new RuntimeException("Unauthorized");
        order.setStatus(OrderStatus.PREPARING);
        return toResp(orderRepo.save(order));
    }

    /** Owner marks order ready for pickup */
    @Transactional
    public OrderDto.Response markReadyForPickup(Long orderId, Long ownerId) {
        Order order = orderRepo.findById(orderId).orElseThrow();
        if (!order.getRestaurant().getOwner().getId().equals(ownerId)) throw new RuntimeException("Unauthorized");
        order.setStatus(OrderStatus.READY_FOR_PICKUP);
        // Generate OTP for delivery
        order.setDeliveryOtp(String.valueOf(100000 + new Random().nextInt(900000)));
        return toResp(orderRepo.save(order));
    }

    /** Agent picks up order from restaurant */
    @Transactional
    public OrderDto.Response agentPickup(Long orderId, Long agentId) {
        Order order = orderRepo.findById(orderId).orElseThrow();
        if (order.getDeliveryAgent() == null || !order.getDeliveryAgent().getId().equals(agentId))
            throw new RuntimeException("This order is not assigned to you");
        if (order.getStatus() != OrderStatus.READY_FOR_PICKUP)
            throw new RuntimeException("Order is not ready for pickup yet");
        order.setStatus(OrderStatus.OUT_FOR_DELIVERY);
        order.setPickedUpAt(LocalDateTime.now());
        return toResp(orderRepo.save(order));
    }

    /** Agent delivers order — customer must verify OTP */
    @Transactional
    public OrderDto.Response deliverOrder(Long orderId, Long agentId, String otp) {
        Order order = orderRepo.findById(orderId).orElseThrow();
        if (order.getDeliveryAgent() == null || !order.getDeliveryAgent().getId().equals(agentId))
            throw new RuntimeException("Not authorized");
        if (order.getStatus() != OrderStatus.OUT_FOR_DELIVERY)
            throw new RuntimeException("Order not out for delivery");
        if (order.getDeliveryOtp() != null && !order.getDeliveryOtp().equals(otp))
            throw new RuntimeException("Invalid OTP");
        order.setStatus(OrderStatus.DELIVERED);
        order.setOtpVerified(true);
        order.setDeliveredAt(LocalDateTime.now());
        // Mark agent available again (they delivered)
        User agent = order.getDeliveryAgent();
        long activeOrders = orderRepo.countByDeliveryAgentIdAndStatus(agentId, OrderStatus.OUT_FOR_DELIVERY);
        if (activeOrders <= 1) { agent.setAvailable(true); userRepo.save(agent); }
        return toResp(orderRepo.save(order));
    }

    /** Agent self-assigns an unassigned READY_FOR_PICKUP order */
    @Transactional
    public OrderDto.Response selfAssign(Long orderId, Long agentId) {
        Order order = orderRepo.findById(orderId).orElseThrow();
        if (order.getDeliveryAgent() != null) throw new RuntimeException("Order already assigned to an agent");
        if (order.getStatus() != OrderStatus.READY_FOR_PICKUP) throw new RuntimeException("Order not ready for pickup");
        User agent = userRepo.findById(agentId).orElseThrow();
        order.setDeliveryAgent(agent);
        order.setAssignedAt(LocalDateTime.now());
        agent.setAvailable(false);
        userRepo.save(agent);
        return toResp(orderRepo.save(order));
    }

    public OrderDto.Response cancelOrder(Long orderId, Long customerId) {
        Order order = orderRepo.findById(orderId).orElseThrow();
        if (!order.getCustomer().getId().equals(customerId)) throw new RuntimeException("Unauthorized");
        if (order.getStatus() != OrderStatus.PENDING) throw new RuntimeException("Cannot cancel order at this stage");
        order.setStatus(OrderStatus.CANCELLED);
        return toResp(orderRepo.save(order));
    }

    public List<OrderDto.Response> getMyOrders(Long customerId) {
        return orderRepo.findByCustomerIdOrderByCreatedAtDesc(customerId).stream().map(this::toResp).collect(Collectors.toList());
    }

    public List<OrderDto.Response> getRestaurantOrders(Long restaurantId, Long ownerId) {
        Restaurant r = restaurantRepo.findById(restaurantId).orElseThrow();
        if (!r.getOwner().getId().equals(ownerId)) throw new RuntimeException("Unauthorized");
        return orderRepo.findByRestaurantIdOrderByCreatedAtDesc(restaurantId).stream().map(this::toResp).collect(Collectors.toList());
    }

    /** Returns orders assigned to this agent */
    public List<OrderDto.Response> getAgentOrders(Long agentId) {
        return orderRepo.findByDeliveryAgentIdOrderByCreatedAtDesc(agentId).stream().map(this::toResp).collect(Collectors.toList());
    }

    /** Returns orders ready for pickup (unassigned) — agents can self-assign these */
    public List<OrderDto.Response> getAvailablePickups() {
        return orderRepo.findByStatusIn(List.of(OrderStatus.READY_FOR_PICKUP)).stream()
                .filter(o -> o.getDeliveryAgent() == null)
                .map(this::toResp).collect(Collectors.toList());
    }

    public List<OrderDto.Response> getAllOrders() {
        return orderRepo.findAllByOrderByCreatedAtDesc().stream().map(this::toResp).collect(Collectors.toList());
    }

    public OrderDto.Response getById(Long id) {
        return toResp(orderRepo.findById(id).orElseThrow());
    }

    /** Admin-level status update */
    @Transactional
    public OrderDto.Response adminUpdateStatus(Long orderId, String status) {
        Order order = orderRepo.findById(orderId).orElseThrow();
        order.setStatus(OrderStatus.valueOf(status));
        return toResp(orderRepo.save(order));
    }

    private OrderDto.Response toResp(Order o) {
        OrderDto.Response r = new OrderDto.Response();
        r.setId(o.getId()); r.setCustomerId(o.getCustomer().getId()); r.setCustomerName(o.getCustomer().getName());
        r.setRestaurantId(o.getRestaurant().getId()); r.setRestaurantName(o.getRestaurant().getName());
        r.setStatus(o.getStatus()); r.setDeliveryAddress(o.getDeliveryAddress());
        r.setSubtotal(o.getSubtotal()); r.setDeliveryFee(o.getDeliveryFee()); r.setTotalAmount(o.getTotalAmount());
        r.setPaymentMethod(o.getPaymentMethod()); r.setPaymentDone(o.isPaymentDone()); r.setSpecialInstructions(o.getSpecialInstructions());
        r.setDeliveryOtp(o.getDeliveryOtp()); r.setOtpVerified(o.isOtpVerified());
        r.setCreatedAt(o.getCreatedAt()); r.setUpdatedAt(o.getUpdatedAt());
        r.setAssignedAt(o.getAssignedAt()); r.setPickedUpAt(o.getPickedUpAt()); r.setDeliveredAt(o.getDeliveredAt());
        if (o.getDeliveryAgent()!=null) { r.setDeliveryAgentId(o.getDeliveryAgent().getId()); r.setDeliveryAgentName(o.getDeliveryAgent().getName()); }
        if (o.getOrderItems()!=null) {
            r.setOrderItems(o.getOrderItems().stream().map(oi->{
                OrderDto.ItemResponse ir = new OrderDto.ItemResponse();
                ir.setId(oi.getId()); ir.setMenuItemId(oi.getMenuItem().getId());
                ir.setMenuItemName(oi.getMenuItem().getName()); ir.setQuantity(oi.getQuantity());
                ir.setPrice(oi.getPrice()); ir.setSubtotal(oi.getSubtotal());
                return ir;
            }).collect(Collectors.toList()));
        }
        return r;
    }
}
