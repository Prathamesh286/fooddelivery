import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { orderApi } from '../services/api'
import { CheckCircle, Clock, ChefHat, Package, Bike, Home, ArrowLeft, MapPin, Phone } from 'lucide-react'
import toast from 'react-hot-toast'

const STEPS = [
  { key: 'PENDING',    label: 'Order Placed',   icon: Clock,       desc: 'Your order has been received' },
  { key: 'CONFIRMED',  label: 'Confirmed',       icon: CheckCircle, desc: 'Restaurant accepted your order' },
  { key: 'PREPARING',  label: 'Preparing',       icon: ChefHat,     desc: 'Chef is cooking your food' },
  { key: 'READY',      label: 'Ready',           icon: Package,     desc: 'Order packed and ready for pickup' },
  { key: 'PICKED_UP',  label: 'On the Way',      icon: Bike,        desc: 'Delivery agent is heading to you' },
  { key: 'DELIVERED',  label: 'Delivered',       icon: Home,        desc: 'Enjoy your meal!' },
]

const STATUS_INDEX = Object.fromEntries(STEPS.map((s,i) => [s.key, i]))

export default function TrackOrderPage() {
  const { id } = useParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchOrder = async () => {
    try {
      const { data } = await orderApi.getById(id)
      setOrder(data)
    } catch { toast.error('Could not load order') }
    finally { setLoading(false) }
  }

  useEffect(() => {
    fetchOrder()
    const interval = setInterval(fetchOrder, 10000) // poll every 10s
    return () => clearInterval(interval)
  }, [id])

  if (loading) return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center">
      <div className="w-12 h-12 border-4 border-ember-500/30 border-t-ember-500 rounded-full animate-spin mx-auto mb-4" />
      <p style={{ color: 'var(--text-muted)' }}>Loading order...</p>
    </div>
  )

  if (!order) return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center">
      <p style={{ color: 'var(--text-muted)' }}>Order not found.</p>
      <Link to="/orders" className="btn-ember mt-4 inline-flex">Back to Orders</Link>
    </div>
  )

  const currentIdx = STATUS_INDEX[order.status] ?? 0
  const isDelivered = order.status === 'DELIVERED'
  const isCancelled = order.status === 'CANCELLED'

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <Link to="/orders" className="inline-flex items-center gap-2 text-sm mb-6 hover:text-ember-400 transition-colors" style={{ color: 'var(--text-muted)' }}>
        <ArrowLeft className="w-4 h-4" /> Back to orders
      </Link>

      <div className="card p-6 mb-6">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h1 className="font-display text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
              Track Order #{order.id}
            </h1>
            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>{order.restaurantName}</p>
          </div>
          <span className={`badge ${isCancelled ? 'badge-red' : isDelivered ? 'badge-green' : 'badge-ember'}`}>
            {order.status?.replace('_', ' ')}
          </span>
        </div>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          Total: <span className="font-semibold text-ember-400">₹{order.totalAmount?.toFixed(2)}</span>
        </p>
      </div>

      {isCancelled ? (
        <div className="card p-8 text-center">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">❌</span>
          </div>
          <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Order Cancelled</h2>
          <p style={{ color: 'var(--text-muted)' }}>This order was cancelled. Refund will be processed if applicable.</p>
        </div>
      ) : (
        <div className="card p-6">
          <h2 className="font-semibold mb-6" style={{ color: 'var(--text-primary)' }}>Order Status</h2>
          <div className="relative">
            {/* Progress line */}
            <div className="absolute left-5 top-5 bottom-5 w-0.5" style={{ background: 'var(--bg-input-border)' }} />
            <div
              className="absolute left-5 top-5 w-0.5 bg-ember-500 transition-all duration-700"
              style={{ height: `${(currentIdx / (STEPS.length - 1)) * 100}%` }}
            />

            <div className="space-y-6">
              {STEPS.map((step, idx) => {
                const done = idx <= currentIdx
                const active = idx === currentIdx
                const Icon = step.icon
                return (
                  <div key={step.key} className="flex items-start gap-4 relative">
                    <div className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 flex-shrink-0 ${
                      done
                        ? 'bg-ember-500 border-ember-500'
                        : 'border-current'
                    } ${active ? 'track-active shadow-lg shadow-ember-500/30' : ''}`}
                      style={!done ? { borderColor: 'var(--bg-input-border)', background: 'var(--bg-primary)' } : {}}
                    >
                      <Icon className={`w-4 h-4 ${done ? 'text-white' : ''}`} style={!done ? { color: 'var(--text-muted)' } : { color: '#1a1109' }} />
                    </div>
                    <div className="pt-1.5">
                      <p className={`text-sm font-semibold ${done ? 'text-ember-400' : ''}`} style={!done ? { color: 'var(--text-muted)' } : {}}>
                        {step.label}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{step.desc}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {isDelivered && (
            <div className="mt-8 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-center">
              <p className="text-emerald-400 font-semibold">🎉 Your order was delivered successfully!</p>
              <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Enjoy your meal. Don't forget to leave a review!</p>
            </div>
          )}
        </div>
      )}

      {/* Order items */}
      {order.items?.length > 0 && (
        <div className="card p-6 mt-6">
          <h2 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Items Ordered</h2>
          <div className="space-y-3">
            {order.items.map((item, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 bg-ember-500/15 rounded-full text-xs flex items-center justify-center text-ember-400 font-bold">{item.quantity}</span>
                  <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{item.menuItemName}</span>
                </div>
                <span className="text-sm font-semibold text-ember-400">₹{item.subtotal?.toFixed(2)}</span>
              </div>
            ))}
            <div className="border-t pt-3 flex justify-between" style={{ borderColor: 'var(--bg-input-border)' }}>
              <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>Total</span>
              <span className="font-bold text-ember-400">₹{order.totalAmount?.toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
