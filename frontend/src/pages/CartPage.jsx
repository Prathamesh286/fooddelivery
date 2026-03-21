import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  Minus, Plus, Trash2, ShoppingBag, ArrowRight, MapPin,
  CreditCard, Wallet, Banknote, Tag, CheckCircle,
  ShieldCheck, Zap, AlertCircle
} from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { orderApi, paymentApi, applyPromo } from '../services/api'
import toast from 'react-hot-toast'

// ─── Load Razorpay script dynamically ────────────────────────────────────────
function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) { resolve(true); return }
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}

// ─── Open Razorpay checkout popup ────────────────────────────────────────────
function openRazorpayCheckout({ keyId, razorpayOrderId, amount, description, userName, userEmail, onSuccess, onFailure }) {
  const options = {
    key: keyId,
    amount,                    // in paise
    currency: 'INR',
    name: 'FoodDash',
    description,
    order_id: razorpayOrderId,
    prefill: { name: userName, email: userEmail },
    theme: { color: '#ff9800' },
    modal: {
      ondismiss: () => {
        toast.error('Payment cancelled')
        onFailure?.('cancelled')
      }
    },
    handler: (response) => {
      // response = { razorpay_order_id, razorpay_payment_id, razorpay_signature }
      onSuccess(response)
    }
  }
  const rzp = new window.Razorpay(options)
  rzp.on('payment.failed', (res) => {
    toast.error('Payment failed: ' + res.error.description)
    onFailure?.(res.error)
  })
  rzp.open()
}

export default function CartPage() {
  const { cart, restaurantId, restaurantName, addToCart, removeFromCart, clearCart, total } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [address, setAddress]           = useState(user?.address || '')
  const [paymentMode, setPaymentMode]   = useState('COD')  // 'COD' | 'ONLINE'
  const [instructions, setInstructions] = useState('')
  const [loading, setLoading]           = useState(false)
  const [promoCode, setPromoCode]       = useState('')
  const [appliedPromo, setAppliedPromo] = useState(null)
  const [promoLoading, setPromoLoading] = useState(false)

  const deliveryFee = 30
  const discount    = appliedPromo?.discount || 0
  const grandTotal  = total + deliveryFee - discount

  // ── Promo handlers ─────────────────────────────────────────────────────────
  const handleApplyPromo = () => {
    if (!promoCode.trim()) return
    setPromoLoading(true)
    setTimeout(() => {
      const result = applyPromo(promoCode, total)
      if (result.error) { toast.error(result.error) }
      else { setAppliedPromo(result); toast.success(`Promo applied: ${result.label} 🎉`) }
      setPromoLoading(false)
    }, 600)
  }

  const handleRemovePromo = () => { setAppliedPromo(null); setPromoCode(''); toast.success('Promo removed') }

  // ── COD flow ───────────────────────────────────────────────────────────────
  const handleCOD = async () => {
    if (!address.trim()) { toast.error('Please enter delivery address'); return }
    setLoading(true)
    try {
      const { data: order } = await orderApi.place({
        restaurantId,
        items: cart.map(i => ({ menuItemId: i.id, quantity: i.quantity })),
        deliveryAddress: address,
        paymentMethod: 'CASH',
        specialInstructions: instructions,
        promoCode: appliedPromo ? promoCode.toUpperCase() : null,
      })
      clearCart()
      toast.success('Order placed! Pay on delivery 🛵')
      navigate(`/orders/${order.id}/track`)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order')
    } finally { setLoading(false) }
  }

  // ── Razorpay online payment flow ──────────────────────────────────────────
  const handleOnlinePayment = async () => {
    if (!address.trim()) { toast.error('Please enter delivery address'); return }
    setLoading(true)

    try {
      // 1. Place order first (status = PENDING, paymentDone = false)
      const { data: order } = await orderApi.place({
        restaurantId,
        items: cart.map(i => ({ menuItemId: i.id, quantity: i.quantity })),
        deliveryAddress: address,
        paymentMethod: 'ONLINE',
        specialInstructions: instructions,
        promoCode: appliedPromo ? promoCode.toUpperCase() : null,
      })

      // 2. Create Razorpay order from backend
      const { data: rzpData } = await paymentApi.createOrder(order.id)

      // 3. Load Razorpay SDK
      const loaded = await loadRazorpayScript()
      if (!loaded) {
        toast.error('Razorpay SDK failed to load. Check your internet connection.')
        setLoading(false)
        return
      }

      setLoading(false)

      // 4. Open Razorpay popup
      openRazorpayCheckout({
        keyId: rzpData.keyId,
        razorpayOrderId: rzpData.razorpayOrderId,
        amount: rzpData.amount,
        description: rzpData.orderDescription,
        userName: user?.name,
        userEmail: user?.email,

        // 5a. On success — verify with backend
        onSuccess: async (response) => {
          const verifyToast = toast.loading('Verifying payment...')
          try {
            const { data: result } = await paymentApi.verify({
              orderId: order.id,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            })
            toast.dismiss(verifyToast)
            if (result.success) {
              clearCart()
              toast.success('Payment successful! Order confirmed 🎉')
              navigate(`/orders/${order.id}/track`)
            } else {
              toast.error('Payment verification failed. Contact support.')
            }
          } catch (e) {
            toast.dismiss(verifyToast)
            toast.error('Verification error. Contact support with Payment ID: ' + response.razorpay_payment_id)
          }
        },

        // 5b. On failure/cancel — order remains in DB as unpaid
        onFailure: () => {
          toast.error('Payment not completed. Your order was not confirmed.')
        }
      })

    } catch (err) {
      setLoading(false)
      toast.error(err.response?.data?.message || 'Something went wrong')
    }
  }

  // ── Main handler based on selected mode ──────────────────────────────────
  const handlePlaceOrder = () => {
    if (paymentMode === 'COD') handleCOD()
    else handleOnlinePayment()
  }

  // ── Empty cart ─────────────────────────────────────────────────────────────
  if (cart.length === 0) return (
    <div className="max-w-lg mx-auto px-4 py-20 text-center">
      <ShoppingBag className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--text-faint)' }}/>
      <h2 className="font-display text-2xl font-bold mb-2" style={{ color: 'var(--text-secondary)' }}>Your cart is empty</h2>
      <p className="mb-6" style={{ color: 'var(--text-muted)' }}>Add items from a restaurant to get started</p>
      <Link to="/" className="btn-ember">Explore Restaurants</Link>
    </div>
  )

  return (
    <div className="max-w-2xl mx-auto px-4 py-8" style={{ animation: 'slideUp 0.5s cubic-bezier(0.16,1,0.3,1)' }}>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Your Cart</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>from <span className="text-ember-400 font-semibold">{restaurantName}</span></p>
        </div>
        <button onClick={clearCart} className="text-xs text-red-400 border border-red-500/20 hover:bg-red-500/10 px-3 py-1.5 rounded-lg transition-all">Clear all</button>
      </div>

      {/* Cart Items */}
      <div className="card p-4 mb-5 space-y-1">
        {cart.map(item => (
          <div key={item.id} className="flex items-center gap-3 py-3 border-b last:border-0" style={{ borderColor: 'var(--bg-input-border)' }}>
            {item.imageUrl && <img src={item.imageUrl} alt={item.name} className="w-14 h-14 rounded-xl object-cover flex-shrink-0"/>}
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate" style={{ color: 'var(--text-primary)' }}>{item.name}</p>
              <p className="text-ember-400 font-bold text-sm">₹{item.price}</p>
            </div>
            <div className="flex items-center gap-2 rounded-xl p-1 flex-shrink-0 border" style={{ background: 'var(--bg-input)', borderColor: 'var(--bg-input-border)' }}>
              <button onClick={() => removeFromCart(item.id)} className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors hover:bg-ember-500/10">
                {item.quantity === 1 ? <Trash2 className="w-3 h-3 text-red-400"/> : <Minus className="w-3 h-3" style={{ color: 'var(--text-secondary)' }}/>}
              </button>
              <span className="w-5 text-center font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{item.quantity}</span>
              <button onClick={() => addToCart(item, restaurantId, restaurantName)} className="w-7 h-7 bg-ember-500 rounded-lg flex items-center justify-center hover:bg-ember-600 transition-colors">
                <Plus className="w-3 h-3" style={{ color: '#1a1109' }}/>
              </button>
            </div>
            <span className="font-bold text-sm w-16 text-right flex-shrink-0" style={{ color: 'var(--text-primary)' }}>₹{(item.price * item.quantity).toFixed(0)}</span>
          </div>
        ))}
      </div>

      {/* Promo Code */}
      <div className="card p-5 mb-5">
        <h3 className="font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
          <Tag className="w-4 h-4 text-ember-400"/>Promo Code
        </h3>
        {appliedPromo ? (
          <div className="flex items-center justify-between p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400"/>
              <span className="text-sm font-semibold text-emerald-400">{promoCode.toUpperCase()}</span>
              <span className="text-xs text-emerald-400">— {appliedPromo.label}</span>
            </div>
            <button onClick={handleRemovePromo} className="text-xs text-red-400 hover:underline">Remove</button>
          </div>
        ) : (
          <div className="flex gap-2">
            <input
              className="input flex-1"
              placeholder="Enter promo code (e.g. WELCOME10)"
              value={promoCode}
              onChange={e => setPromoCode(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleApplyPromo()}
            />
            <button onClick={handleApplyPromo} disabled={promoLoading} className="btn-ember px-4 py-2 text-sm">
              {promoLoading ? <span className="w-4 h-4 border-2 border-night-950/30 border-t-night-950 rounded-full animate-spin"/> : 'Apply'}
            </button>
          </div>
        )}
        <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>Try: WELCOME10 · FLAT50 · FIRST20</p>
      </div>

      {/* Delivery Address */}
      <div className="card p-5 mb-5">
        <h3 className="font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
          <MapPin className="w-4 h-4 text-ember-400"/>Delivery Address
        </h3>
        <textarea
          className="input resize-none"
          rows={2}
          placeholder="Enter your full delivery address"
          value={address}
          onChange={e => setAddress(e.target.value)}
        />
        <div className="mt-3">
          <label className="label">Special Instructions (optional)</label>
          <input className="input" placeholder="No onions, extra spicy, ring bell..." value={instructions} onChange={e => setInstructions(e.target.value)}/>
        </div>
      </div>

      {/* Payment Method */}
      <div className="card p-5 mb-5">
        <h3 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Payment Method</h3>
        <div className="grid grid-cols-2 gap-3">

          {/* Cash on Delivery */}
          <button
            onClick={() => setPaymentMode('COD')}
            className={`relative flex flex-col items-start gap-2 p-4 rounded-2xl border-2 text-left transition-all duration-200 ${
              paymentMode === 'COD'
                ? 'border-amber-500 bg-amber-500/8'
                : 'hover:border-amber-500/30'
            }`}
            style={paymentMode !== 'COD' ? { borderColor: 'var(--bg-input-border)' } : {}}
          >
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${paymentMode === 'COD' ? 'bg-amber-500/20' : 'bg-amber-500/10'}`}>
              <Banknote className="w-5 h-5 text-amber-500"/>
            </div>
            <div>
              <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Cash on Delivery</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Pay when delivered</p>
            </div>
            {paymentMode === 'COD' && (
              <div className="absolute top-3 right-3 w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center">
                <CheckCircle className="w-3 h-3 text-white"/>
              </div>
            )}
          </button>

          {/* Online Payment */}
          <button
            onClick={() => setPaymentMode('ONLINE')}
            className={`relative flex flex-col items-start gap-2 p-4 rounded-2xl border-2 text-left transition-all duration-200 ${
              paymentMode === 'ONLINE'
                ? 'border-ember-500 bg-ember-500/8'
                : 'hover:border-ember-500/30'
            }`}
            style={paymentMode !== 'ONLINE' ? { borderColor: 'var(--bg-input-border)' } : {}}
          >
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${paymentMode === 'ONLINE' ? 'bg-ember-500/20' : 'bg-ember-500/10'}`}>
              <Zap className="w-5 h-5 text-ember-400"/>
            </div>
            <div>
              <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Pay Online</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>UPI · Cards · Wallets</p>
            </div>
            {paymentMode === 'ONLINE' && (
              <div className="absolute top-3 right-3 w-5 h-5 bg-ember-500 rounded-full flex items-center justify-center">
                <CheckCircle className="w-3 h-3" style={{ color: '#1a1109' }}/>
              </div>
            )}
          </button>
        </div>

        {/* Online payment method icons */}
        {paymentMode === 'ONLINE' && (
          <div className="mt-4 p-3 rounded-xl flex items-center gap-3 flex-wrap" style={{ background: 'var(--bg-input)' }}>
            <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0"/>
            <span className="text-xs text-emerald-400 font-medium">Secured by Razorpay</span>
            <div className="flex items-center gap-2 ml-auto flex-wrap">
              {/* UPI */}
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-purple-500/15 text-purple-400 border border-purple-500/20">UPI</span>
              {/* Visa */}
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-500/15 text-blue-400 border border-blue-500/20">VISA</span>
              {/* Mastercard */}
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-red-500/15 text-red-400 border border-red-500/20">MC</span>
              {/* Net Banking */}
              <span className="text-xs font-bold px-2 py-0.5 rounded" style={{ background: 'var(--bg-card)', color: 'var(--text-secondary)', border: '1px solid var(--bg-input-border)' }}>NetBanking</span>
            </div>
          </div>
        )}

        {/* Test mode note */}
        {paymentMode === 'ONLINE' && (
          <div className="mt-3 flex items-start gap-2 p-3 rounded-xl bg-amber-500/8 border border-amber-500/20">
            <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5"/>
            <p className="text-xs text-amber-400">
              <span className="font-semibold">Test mode:</span> Use UPI ID <code className="bg-amber-500/15 px-1 rounded">success@razorpay</code> or card <code className="bg-amber-500/15 px-1 rounded">4111 1111 1111 1111</code> (any CVV/expiry)
            </p>
          </div>
        )}
      </div>

      {/* Bill Summary */}
      <div className="card p-5 mb-6 relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-ember-500/30 to-transparent"/>
        <h3 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Bill Summary</h3>
        <div className="space-y-2.5 text-sm">
          <div className="flex justify-between" style={{ color: 'var(--text-muted)' }}>
            <span>Item total ({cart.reduce((a,i)=>a+i.quantity,0)} items)</span>
            <span>₹{total.toFixed(0)}</span>
          </div>
          <div className="flex justify-between" style={{ color: 'var(--text-muted)' }}>
            <span>Delivery fee</span><span>₹{deliveryFee}</span>
          </div>
          {appliedPromo && (
            <div className="flex justify-between text-emerald-400 font-semibold">
              <span>Discount ({appliedPromo.label})</span>
              <span>−₹{discount.toFixed(0)}</span>
            </div>
          )}
          <div className="h-px my-1" style={{ background: 'var(--bg-input-border)' }}/>
          <div className="flex justify-between font-bold text-base" style={{ color: 'var(--text-primary)' }}>
            <span>Grand Total</span>
            <span className="text-ember-400">₹{grandTotal.toFixed(0)}</span>
          </div>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            {paymentMode === 'COD' ? '💵 Pay ₹' + grandTotal.toFixed(0) + ' in cash at delivery' : '🔒 Secure online payment via Razorpay'}
          </p>
        </div>
      </div>

      {/* Place Order Button */}
      <button
        onClick={handlePlaceOrder}
        disabled={loading}
        className="btn-ember w-full py-4 text-base shadow-xl shadow-ember-500/20"
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <span className="w-4 h-4 border-2 border-night-950/30 border-t-night-950 rounded-full animate-spin"/>
            {paymentMode === 'ONLINE' ? 'Creating payment...' : 'Placing Order...'}
          </span>
        ) : paymentMode === 'ONLINE' ? (
          <><Zap className="w-5 h-5"/><span>Pay ₹{grandTotal.toFixed(0)} Online</span><ArrowRight className="w-5 h-5"/></>
        ) : (
          <><Banknote className="w-5 h-5"/><span>Place Order · Pay ₹{grandTotal.toFixed(0)} on Delivery</span><ArrowRight className="w-5 h-5"/></>
        )}
      </button>
    </div>
  )
}
