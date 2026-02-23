package com.fooddelivery.config;
import com.fooddelivery.entity.*;
import com.fooddelivery.enums.Role;
import com.fooddelivery.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
@Component @RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {
    private final UserRepository userRepo;
    private final RestaurantRepository restaurantRepo;
    private final MenuItemRepository menuRepo;
    private final PasswordEncoder encoder;
    @Override
    public void run(String... args) {
        if (userRepo.count() > 0) return;
        User admin = save(User.builder().name("Admin").email("admin@food.com").password(encoder.encode("admin123")).role(Role.ADMIN).phone("9000000001").build());
        User customer = save(User.builder().name("Rahul Sharma").email("customer@food.com").password(encoder.encode("customer123")).role(Role.CUSTOMER).phone("9000000002").address("12 MG Road, Pune").build());
        User owner = save(User.builder().name("Priya Patel").email("owner@food.com").password(encoder.encode("owner123")).role(Role.RESTAURANT_OWNER).phone("9000000003").build());
        User agent1 = save(User.builder().name("Ravi Kumar").email("agent@food.com").password(encoder.encode("agent123")).role(Role.DELIVERY_AGENT).phone("9000000004").vehicleNumber("MH12AB1234").available(true).build());
        User agent2 = save(User.builder().name("Suresh Nair").email("agent2@food.com").password(encoder.encode("agent123")).role(Role.DELIVERY_AGENT).phone("9000000005").vehicleNumber("MH12CD5678").available(true).build());

        Restaurant r1 = restaurantRepo.save(Restaurant.builder().name("Spice Garden").description("Authentic Indian cuisine with rich flavors and traditional recipes passed down generations").address("42 Curry Lane, Koregaon Park, Pune").phone("020-12345678").imageUrl("https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800").cuisine("Indian").openingHours("10:00 AM - 11:00 PM").rating(4.5).reviewCount(120).deliveryTime(35).deliveryFee(25.0).minOrderAmount(150.0).owner(owner).build());
        Restaurant r2 = restaurantRepo.save(Restaurant.builder().name("Pizza Paradise").description("Wood-fired authentic Neapolitan pizzas with fresh imported Italian ingredients").address("88 Napoli Road, Baner, Pune").phone("020-87654321").imageUrl("https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800").cuisine("Italian").openingHours("11:00 AM - 11:00 PM").rating(4.3).reviewCount(89).deliveryTime(25).deliveryFee(30.0).minOrderAmount(200.0).owner(owner).build());
        Restaurant r3 = restaurantRepo.save(Restaurant.builder().name("Dragon Wok").description("Best Chinese and Pan-Asian fusion dishes in the city, made fresh daily").address("55 Dragon Street, Viman Nagar, Pune").phone("020-11223344").imageUrl("https://images.unsplash.com/photo-1563245372-f21724e3856d?w=800").cuisine("Chinese").openingHours("12:00 PM - 11:00 PM").rating(4.1).reviewCount(67).deliveryTime(40).deliveryFee(20.0).minOrderAmount(120.0).owner(owner).build());
        Restaurant r4 = restaurantRepo.save(Restaurant.builder().name("Burger Barn").description("Gourmet handcrafted burgers with premium ingredients and signature sauces").address("12 Fast Food Ave, Hinjewadi, Pune").phone("020-55667788").imageUrl("https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800").cuisine("American").openingHours("10:00 AM - 12:00 AM").rating(4.6).reviewCount(200).deliveryTime(20).deliveryFee(15.0).minOrderAmount(100.0).owner(owner).build());
        Restaurant r5 = restaurantRepo.save(Restaurant.builder().name("Sushi Sky").description("Premium Japanese sushi and ramen crafted by expert chefs from Tokyo").address("9 Sakura Road, Kalyani Nagar, Pune").phone("020-99887766").imageUrl("https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=800").cuisine("Japanese").openingHours("12:00 PM - 10:00 PM").rating(4.7).reviewCount(150).deliveryTime(45).deliveryFee(40.0).minOrderAmount(300.0).owner(owner).build());

        // Indian
        addItem(r1,"Butter Chicken","Creamy tomato-based curry with tender chicken pieces",280,"https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=400","Main Course",false);
        addItem(r1,"Paneer Tikka Masala","Cottage cheese in rich spiced gravy with aromatic herbs",250,"https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400","Main Course",true);
        addItem(r1,"Chicken Biryani","Fragrant basmati rice layered with spiced chicken",320,"https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400","Rice",false);
        addItem(r1,"Dal Makhani","Slow-cooked black lentils simmered in butter and cream",200,"https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400","Main Course",true);
        addItem(r1,"Garlic Naan","Soft bread baked in tandoor with garlic and butter",60,"https://images.unsplash.com/photo-1585396415893-f634a2dd8d05?w=400","Bread",true);
        addItem(r1,"Mango Lassi","Sweet yogurt drink blended with fresh Alphonso mango",80,"https://images.unsplash.com/photo-1626200419199-391ae4be7a41?w=400","Beverages",true);
        addItem(r1,"Tandoori Chicken","Marinated chicken grilled in clay oven with spices",320,"https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=400","Starter",false);
        // Italian
        addItem(r2,"Margherita Pizza","Classic tomato, fresh mozzarella and basil on thin crust",350,"https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400","Pizza",true);
        addItem(r2,"Pepperoni Pizza","Loaded with premium spicy pepperoni and mozzarella",420,"https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400","Pizza",false);
        addItem(r2,"Pasta Carbonara","Creamy pasta with crispy bacon, egg yolk and parmesan",300,"https://images.unsplash.com/photo-1612874742237-6526221588e3?w=400","Pasta",false);
        addItem(r2,"Tiramisu","Classic Italian dessert with espresso-soaked ladyfingers",180,"https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400","Dessert",true);
        addItem(r2,"Bruschetta","Toasted bread topped with tomatoes, garlic and fresh basil",150,"https://images.unsplash.com/photo-1572695157366-5e585ab2b69f?w=400","Starter",true);
        addItem(r2,"Penne Arrabbiata","Penne pasta in fiery tomato sauce with red chillies",280,"https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400","Pasta",true);
        // Chinese
        addItem(r3,"Chicken Fried Rice","Wok-tossed rice with vegetables, egg and chicken",220,"https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400","Rice",false);
        addItem(r3,"Kung Pao Chicken","Spicy stir-fry with peanuts, dried chillies and vegetables",280,"https://images.unsplash.com/photo-1525755662778-989d0524087e?w=400","Main Course",false);
        addItem(r3,"Spring Rolls","Crispy golden rolls filled with vegetables and noodles",150,"https://images.unsplash.com/photo-1546069901-d5bfd2cbfb1f?w=400","Starter",true);
        addItem(r3,"Hakka Noodles","Stir-fried noodles with fresh vegetables in Chinese sauces",200,"https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?w=400","Noodles",true);
        addItem(r3,"Dim Sum (6 pcs)","Steamed dumplings filled with vegetables and tofu",180,"https://images.unsplash.com/photo-1563245372-f21724e3856d?w=400","Starter",true);
        // Burgers
        addItem(r4,"Classic Cheeseburger","Beef patty with aged cheddar, lettuce, tomato and pickles",280,"https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400","Burger",false);
        addItem(r4,"Veggie Delight Burger","Plant-based patty with avocado, lettuce and chipotle mayo",240,"https://images.unsplash.com/photo-1585238342024-78d387f4a707?w=400","Burger",true);
        addItem(r4,"Crispy Chicken Burger","Fried chicken with coleslaw and spicy sriracha sauce",260,"https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=400","Burger",false);
        addItem(r4,"Loaded Fries","Golden fries with cheese sauce, jalapeños and sour cream",150,"https://images.unsplash.com/photo-1576107232684-1279f390859f?w=400","Sides",true);
        addItem(r4,"Oreo Milkshake","Thick creamy milkshake blended with Oreo cookies",180,"https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=400","Beverages",true);
        // Sushi
        addItem(r5,"Dragon Roll (8 pcs)","Shrimp tempura topped with avocado and spicy mayo",480,"https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400","Sushi",false);
        addItem(r5,"Veggie Maki (8 pcs)","Fresh cucumber, avocado and pickled radish rolls",320,"https://images.unsplash.com/photo-1617196034183-421b4040ed20?w=400","Sushi",true);
        addItem(r5,"Tonkotsu Ramen","Rich pork bone broth with chashu, soft egg and nori",380,"https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400","Ramen",false);
        addItem(r5,"Edamame","Steamed salted soybeans – perfect starter",120,"https://images.unsplash.com/photo-1564834744159-ff0ea41ba4b9?w=400","Starter",true);
        addItem(r5,"Miso Soup","Traditional Japanese soup with tofu and seaweed",80,"https://images.unsplash.com/photo-1547592180-85f173990554?w=400","Soup",true);

        System.out.println("✅ FoodRush DB seeded!");
        System.out.println("   customer@food.com / customer123");
        System.out.println("   owner@food.com    / owner123");
        System.out.println("   agent@food.com    / agent123");
        System.out.println("   agent2@food.com   / agent123");
        System.out.println("   admin@food.com    / admin123");
    }
    private User save(User u){ return userRepo.save(u); }
    private void addItem(Restaurant r,String name,String desc,double price,String img,String cat,boolean veg){
        menuRepo.save(MenuItem.builder().name(name).description(desc).price(price).imageUrl(img).category(cat).vegetarian(veg).restaurant(r).build());
    }
}
