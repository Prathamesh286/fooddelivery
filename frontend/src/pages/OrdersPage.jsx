import React, { useState, useEffect } from 'react'
import { Package, Clock, CheckCircle, XCircle, Bike, ChefHat, ShoppingBag, AlertTriangle, Key } from 'lucide-react'
import { orderApi } from '../services/api'
import toast from 'react-hot-toast'

const STATUS = {
  PENDING:          { label:'Pending',          icon:Clock,         badge:'badge-yellow', step:0 },
  CONFIRMED:        { label:'Confirmed',         icon:CheckCircle,   badge:'badge-blue',   step:1 },
  PREPARING:        { label:'Preparing',         icon:ChefHat,       badge:'badge-ember',  step:2 },
  READY_FOR_PICKUP: { label:'Ready for Pickup',  icon:Package,       badge:'badge-purple', step:3 },
  OUT_FOR_DELIVERY: { label:'Out for Delivery',  icon:Bike,          badge:'badge-purple', step:4 },
  DELIVERED:        { label:'Delivered',         icon:CheckCircle,   badge:'badge-green',  step:5 },
  CANCELLED:        { label:'Cancelled',         icon:XCircle,       badge:'badge-red',    step:-1 },
}
const STEPS = ['Confirmed','Preparing','Ready','Out for Delivery','Delivered']

export default function OrdersPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState(null)

  useEffect(() => { loadOrders() }, [])
  const loadOrders = async () => {
    try { const r = await orderApi.getMy(); setOrders(r.data) }
    catch { toast.error('Failed to load orders') }
    finally { setLoading(false) }
  }
  const handleCancel = async id => {
    setCancelling(id)
    try { await orderApi.cancel(id); toast.success('Order cancelled'); loadOrders() }
    catch(e) { toast.error(e.response?.data?.message||'Cannot cancel') }
    finally { setCancelling(null) }
  }

  if (loading) return <div className="max-w-2xl mx-auto px-4 py-20 text-center text-night-500">Loading orders...</div>

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="font-display text-2xl font-bold text-night-50 mb-6">My Orders</h1>
      {orders.length===0 ? (
        <div className="text-center py-20 animate-fade-in">
          <ShoppingBag className="w-16 h-16 text-night-700 mx-auto mb-4"/>
          <h3 className="text-xl font-bold text-night-400 mb-2">No orders yet</h3>
          <p className="text-night-600 text-sm">Your order history will appear here</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => {
            const cfg = STATUS[order.status]||STATUS.PENDING
            const Icon = cfg.icon
            const step = cfg.step
            return (
              <div key={order.id} className="card border border-night-700/60 animate-slide-up">
                {/* Header */}
                <div className="p-5 border-b border-night-800/60">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <span className="font-bold text-night-100">{order.restaurantName}</span>
                      <span className="text-night-600 text-xs ml-2 font-mono">#{order.id}</span>
                    </div>
                    <span className={cfg.badge}><Icon className="w-3 h-3"/>{cfg.label}</span>
                  </div>
                  <p className="text-night-600 text-xs">{new Date(order.createdAt).toLocaleString()}</p>
                </div>

                {/* Progress bar - only for non-cancelled active orders */}
                {order.status!=='CANCELLED' && step>0 && step<5 && (
                  <div className="px-5 py-4 border-b border-night-800/60">
                    <div className="flex justify-between mb-2">
                      {STEPS.map((s,i) => (
                        <div key={s} className="flex flex-col items-center gap-1 flex-1">
                          <div className={`w-4 h-4 rounded-full border-2 transition-colors ${i<step ? 'bg-ember-500 border-ember-500' : i===step ? 'bg-night-950 border-ember-500 animate-pulse-slow' : 'bg-night-800 border-night-700'}`}/>
                          <span className={`text-xs hidden sm:block ${i<=step ? 'text-ember-400' : 'text-night-700'}`}>{s}</span>
                        </div>
                      ))}
                    </div>
                    <div className="relative h-1 bg-night-800 rounded-full mt-1">
                      <div className="absolute top-0 left-0 h-full bg-ember-500 rounded-full transition-all duration-500" style={{width:`${Math.max(0,(step-1)/(STEPS.length-1)*100)}%`}}/>
                    </div>
                  </div>
                )}

                {/* OTP for delivery */}
                {order.deliveryOtp && order.status==='OUT_FOR_DELIVERY' && !order.otpVerified && (
                  <div className="px-5 py-3 border-b border-night-800/60 bg-ember-500/5">
                    <div className="flex items-center gap-2">
                      <Key className="w-4 h-4 text-ember-400"/>
                      <span className="text-sm text-night-300">Delivery OTP (share with agent):</span>
                      <span className="font-mono font-bold text-ember-400 text-lg tracking-widest">{order.deliveryOtp}</span>
                    </div>
                  </div>
                )}

                {/* Items */}
                <div className="p-5">
                  <div className="space-y-1.5 mb-4">
                    {order.orderItems?.map(item => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span className="text-night-400">{item.menuItemName} <span className="text-night-600">×{item.quantity}</span></span>
                        <span className="text-night-300 font-medium">₹{item.subtotal.toFixed(0)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-night-800 pt-3 flex items-center justify-between">
                    <div className="text-xs text-night-500">
                      <span>+ ₹{order.deliveryFee} delivery • </span>
                      <span className="font-bold text-night-200 text-sm">Total ₹{order.totalAmount?.toFixed(0)}</span>
                    </div>
                    {order.status==='PENDING' && (
                      <button onClick={()=>handleCancel(order.id)} disabled={cancelling===order.id} className="btn-danger text-sm">
                        {cancelling===order.id?'Cancelling...':'Cancel Order'}
                      </button>
                    )}
                  </div>
                  <p className="text-night-600 text-xs mt-2 flex items-center gap-1"><span>📍</span>{order.deliveryAddress}</p>
                  {order.deliveryAgentName && (
                    <p className="text-night-600 text-xs mt-1 flex items-center gap-1"><Bike className="w-3 h-3"/>{order.deliveryAgentName} is delivering your order</p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
