import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, MapPin, CreditCard, Wallet, Banknote } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { orderApi } from '../services/api'
import toast from 'react-hot-toast'

export default function CartPage() {
  const { cart, restaurantId, restaurantName, addToCart, removeFromCart, clearCart, total } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [address, setAddress] = useState(user?.address || '')
  const [payment, setPayment] = useState('CASH')
  const [instructions, setInstructions] = useState('')
  const [loading, setLoading] = useState(false)
  const deliveryFee = 30
  const grandTotal = total + deliveryFee

  const handleOrder = async () => {
    if (!address.trim()) { toast.error('Please enter delivery address'); return }
    setLoading(true)
    try {
      await orderApi.place({ restaurantId, items: cart.map(i=>({menuItemId:i.id,quantity:i.quantity})), deliveryAddress:address, paymentMethod:payment, specialInstructions:instructions })
      clearCart()
      toast.success('Order placed! 🎉')
      navigate('/orders')
    } catch(err) { toast.error(err.response?.data?.message||'Failed to place order') }
    finally { setLoading(false) }
  }

  if (cart.length===0) return (
    <div className="max-w-lg mx-auto px-4 py-20 text-center">
      <ShoppingBag className="w-16 h-16 text-night-700 mx-auto mb-4"/>
      <h2 className="font-display text-2xl font-bold text-night-300 mb-2">Your cart is empty</h2>
      <p className="text-night-600 mb-6">Add items from a restaurant to get started</p>
      <Link to="/" className="btn-ember">Explore Restaurants</Link>
    </div>
  )

  const PAYMENTS = [
    { v:'CASH', l:'Cash on Delivery', icon:Banknote },
    { v:'CARD', l:'Card', icon:CreditCard },
    { v:'UPI', l:'UPI', icon:Wallet },
  ]

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 animate-slide-up">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-night-50">Your Cart</h1>
          <p className="text-night-500 text-sm mt-0.5">from <span className="text-ember-400 font-semibold">{restaurantName}</span></p>
        </div>
        <button onClick={clearCart} className="text-xs text-red-500 hover:text-red-400 border border-red-500/20 hover:bg-red-500/10 px-3 py-1.5 rounded-lg transition-all">Clear all</button>
      </div>

      {/* Items */}
      <div className="card p-4 mb-5 space-y-3">
        {cart.map(item => (
          <div key={item.id} className="flex items-center gap-3 py-2 border-b border-night-800/60 last:border-0">
            {item.imageUrl && <img src={item.imageUrl} alt={item.name} className="w-14 h-14 rounded-xl object-cover flex-shrink-0"/>}
            <div className="flex-1 min-w-0">
              <p className="font-medium text-night-100 text-sm truncate">{item.name}</p>
              <p className="text-ember-400 font-bold text-sm">₹{item.price}</p>
            </div>
            <div className="flex items-center gap-2 bg-night-800 border border-night-700 rounded-xl p-1 flex-shrink-0">
              <button onClick={()=>removeFromCart(item.id)} className="w-7 h-7 bg-night-700 hover:bg-night-600 rounded-lg flex items-center justify-center transition-colors">
                {item.quantity===1 ? <Trash2 className="w-3 h-3 text-red-400"/> : <Minus className="w-3 h-3 text-night-300"/>}
              </button>
              <span className="w-5 text-center font-bold text-night-100 text-sm">{item.quantity}</span>
              <button onClick={()=>addToCart(item,restaurantId,restaurantName)} className="w-7 h-7 bg-ember-500 rounded-lg flex items-center justify-center hover:bg-ember-600 transition-colors">
                <Plus className="w-3 h-3 text-night-950"/>
              </button>
            </div>
            <span className="text-night-200 font-bold text-sm w-14 text-right flex-shrink-0">₹{(item.price*item.quantity).toFixed(0)}</span>
          </div>
        ))}
      </div>

      {/* Delivery */}
      <div className="card p-5 mb-5">
        <h3 className="font-semibold text-night-100 mb-4 flex items-center gap-2"><MapPin className="w-4 h-4 text-ember-400"/>Delivery Details</h3>
        <div className="space-y-4">
          <div>
            <label className="label">Delivery Address *</label>
            <textarea className="input resize-none" rows={2} placeholder="Enter your full delivery address" value={address} onChange={e=>setAddress(e.target.value)}/>
          </div>
          <div>
            <label className="label">Payment Method</label>
            <div className="grid grid-cols-3 gap-2">
              {PAYMENTS.map(p => (
                <button key={p.v} onClick={()=>setPayment(p.v)}
                  className={`flex flex-col items-center gap-1 p-3 rounded-xl border text-xs font-semibold transition-all ${payment===p.v ? 'border-ember-500/60 bg-ember-500/10 text-ember-400' : 'border-night-700 text-night-500 hover:border-night-600'}`}>
                  <p.icon className="w-4 h-4"/>{p.l}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="label">Special Instructions (optional)</label>
            <input className="input" placeholder="No onions, extra spicy..." value={instructions} onChange={e=>setInstructions(e.target.value)}/>
          </div>
        </div>
      </div>

      {/* Bill */}
      <div className="card p-5 mb-6 border border-ember-500/15">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-ember-500/30 to-transparent"/>
        <h3 className="font-semibold text-night-100 mb-4">Bill Summary</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between text-night-400"><span>Item total</span><span>₹{total.toFixed(0)}</span></div>
          <div className="flex justify-between text-night-400"><span>Delivery fee</span><span>₹{deliveryFee}</span></div>
          <div className="flex justify-between font-bold text-night-100 text-base border-t border-night-800 pt-3 mt-1"><span>Grand Total</span><span className="text-ember-400">₹{grandTotal.toFixed(0)}</span></div>
        </div>
      </div>

      <button onClick={handleOrder} disabled={loading} className="btn-ember w-full py-4 text-base shadow-xl shadow-ember-500/20">
        {loading ? <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-night-950/30 border-t-night-950 rounded-full animate-spin"/>Placing Order...</span>
          : <><span>Place Order • ₹{grandTotal.toFixed(0)}</span><ArrowRight className="w-5 h-5"/></>}
      </button>
    </div>
  )
}
