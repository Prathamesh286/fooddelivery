import React, { useState, useEffect } from 'react'
import { Bike, MapPin, Package, CheckCircle, Clock, RefreshCw, Navigation, Key, AlertCircle, TrendingUp, Star } from 'lucide-react'
import { orderApi } from '../services/api'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

const TAB = { MY:'my', AVAILABLE:'available', HISTORY:'history' }

export default function AgentPage() {
  const { user } = useAuth()
  const [tab, setTab] = useState(TAB.MY)
  const [myOrders, setMyOrders] = useState([])
  const [available, setAvailable] = useState([])
  const [otp, setOtp] = useState({})
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(null)

  useEffect(() => { loadAll() }, [])

  const loadAll = async () => {
    setLoading(true)
    try {
      const [myRes, avRes] = await Promise.all([orderApi.getAgentOrders(), orderApi.getAvailablePickups()])
      setMyOrders(myRes.data)
      setAvailable(avRes.data)
    } catch { toast.error('Failed to load orders') }
    finally { setLoading(false) }
  }

  const doAction = async (fn, successMsg) => {
    try { await fn(); toast.success(successMsg); loadAll() }
    catch(e) { toast.error(e.response?.data?.message || 'Failed') }
    finally { setActionLoading(null) }
  }

  const handleSelfAssign = id => { setActionLoading(id); doAction(()=>orderApi.selfAssign(id), '✅ Order assigned to you!') }
  const handlePickup = id => { setActionLoading(id); doAction(()=>orderApi.pickup(id), '🚀 Picked up! Start delivery!') }
  const handleDeliver = id => {
    const otpVal = otp[id] || ''
    if (!otpVal || otpVal.length < 4) { toast.error('Enter the OTP from customer'); return }
    setActionLoading(id)
    doAction(()=>orderApi.deliver(id, otpVal), '🎉 Delivered successfully!')
  }

  const active = myOrders.filter(o => ['CONFIRMED','PREPARING','READY_FOR_PICKUP','OUT_FOR_DELIVERY'].includes(o.status))
  const history = myOrders.filter(o => ['DELIVERED','CANCELLED'].includes(o.status))
  const earnings = history.filter(o=>o.status==='DELIVERED').reduce((s,o)=>s+o.deliveryFee,0)

  if (loading) return <div className="p-8 text-center text-night-500">Loading deliveries...</div>

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Agent header */}
      <div className="card p-5 mb-6 border border-purple-500/20 bg-purple-500/5">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-purple-500/20 border border-purple-500/30 rounded-2xl flex items-center justify-center">
            <Bike className="w-6 h-6 text-purple-400"/>
          </div>
          <div className="flex-1">
            <h2 className="font-bold text-night-100">{user?.name}</h2>
            <p className="text-night-500 text-xs">{user?.vehicleNumber || 'Delivery Agent'}</p>
          </div>
          <button onClick={loadAll} className="btn-ghost text-xs py-1.5 px-3"><RefreshCw className="w-3.5 h-3.5"/>Refresh</button>
        </div>
        {/* Mini stats */}
        <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-night-800">
          <div className="text-center"><p className="text-lg font-bold text-purple-400">{active.length}</p><p className="text-xs text-night-500">Active</p></div>
          <div className="text-center"><p className="text-lg font-bold text-emerald-400">{history.filter(o=>o.status==='DELIVERED').length}</p><p className="text-xs text-night-500">Delivered</p></div>
          <div className="text-center"><p className="text-lg font-bold text-ember-400">₹{earnings.toFixed(0)}</p><p className="text-xs text-night-500">Earned</p></div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-night-800/60 border border-night-700 rounded-2xl mb-6">
        {[
          { key:TAB.MY, label:`My Orders`, count:active.length },
          { key:TAB.AVAILABLE, label:'Available', count:available.length },
          { key:TAB.HISTORY, label:'History', count:history.length },
        ].map(t => (
          <button key={t.key} onClick={()=>setTab(t.key)}
            className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-1.5 ${tab===t.key ? 'bg-ember-500 text-night-950 shadow-lg' : 'text-night-400 hover:text-night-200'}`}>
            {t.label}
            {t.count>0 && <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${tab===t.key ? 'bg-night-950/20' : 'bg-night-700 text-night-400'}`}>{t.count}</span>}
          </button>
        ))}
      </div>

      {/* MY ORDERS tab */}
      {tab===TAB.MY && (
        <div className="space-y-4">
          {active.length===0 ? (
            <div className="card p-12 text-center">
              <Package className="w-12 h-12 text-night-700 mx-auto mb-3"/>
              <p className="text-night-400 font-medium">No active orders</p>
              <p className="text-night-600 text-sm mt-1">Check "Available" tab to self-assign orders</p>
            </div>
          ) : active.map(order => (
            <div key={order.id} className="card p-5 border border-purple-500/20 animate-slide-up">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <span className="font-bold text-night-100">Order #{order.id}</span>
                  <p className="text-night-500 text-xs mt-0.5">from {order.restaurantName}</p>
                </div>
                <span className={`badge ${order.status==='OUT_FOR_DELIVERY'?'badge-purple':order.status==='READY_FOR_PICKUP'?'badge-ember':'badge-blue'}`}>
                  {order.status.replace(/_/g,' ')}
                </span>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-start gap-2 text-sm"><MapPin className="w-4 h-4 text-ember-400 mt-0.5 flex-shrink-0"/><span className="text-night-300">{order.deliveryAddress}</span></div>
                <div className="text-xs text-night-500 pl-6">{order.orderItems?.map(i=>`${i.menuItemName}×${i.quantity}`).join(', ')}</div>
              </div>

              <div className="flex items-center gap-2 justify-between border-t border-night-800 pt-3">
                <span className="font-bold text-ember-400">₹{order.totalAmount?.toFixed(0)}</span>
                <div className="flex items-center gap-2">
                  {/* Pickup from restaurant */}
                  {order.status==='READY_FOR_PICKUP' && (
                    <button onClick={()=>handlePickup(order.id)} disabled={actionLoading===order.id} className="btn-ember text-sm py-2 px-4">
                      {actionLoading===order.id?'...':<><Navigation className="w-3.5 h-3.5"/>Picked Up</>}
                    </button>
                  )}
                  {/* Deliver to customer */}
                  {order.status==='OUT_FOR_DELIVERY' && (
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <input type="text" className="input text-sm py-2 w-28 font-mono tracking-widest" maxLength={6}
                          placeholder="Enter OTP" value={otp[order.id]||''} onChange={e=>setOtp({...otp,[order.id]:e.target.value})}/>
                        <Key className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-night-600"/>
                      </div>
                      <button onClick={()=>handleDeliver(order.id)} disabled={actionLoading===order.id} className="btn-ember text-sm py-2 px-4">
                        {actionLoading===order.id?'...':<><CheckCircle className="w-3.5 h-3.5"/>Deliver</>}
                      </button>
                    </div>
                  )}
                  {/* Waiting states */}
                  {['CONFIRMED','PREPARING'].includes(order.status) && (
                    <div className="flex items-center gap-1.5 text-night-500 text-xs">
                      <Clock className="w-3.5 h-3.5 animate-spin"/>Waiting for restaurant...
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* AVAILABLE tab */}
      {tab===TAB.AVAILABLE && (
        <div className="space-y-3">
          {available.length===0 ? (
            <div className="card p-12 text-center">
              <AlertCircle className="w-12 h-12 text-night-700 mx-auto mb-3"/>
              <p className="text-night-400 font-medium">No orders available for pickup</p>
              <p className="text-night-600 text-sm mt-1">Check back soon or refresh</p>
            </div>
          ) : available.map(order => (
            <div key={order.id} className="card p-5 border border-ember-500/20 animate-fade-in">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <span className="font-bold text-night-100">Order #{order.id}</span>
                  <p className="text-night-500 text-xs">from {order.restaurantName}</p>
                </div>
                <span className="badge-ember">Ready for Pickup</span>
              </div>
              <div className="flex items-start gap-2 text-sm mb-3">
                <MapPin className="w-4 h-4 text-ember-400 mt-0.5 flex-shrink-0"/>
                <span className="text-night-300">{order.deliveryAddress}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-ember-400">₹{order.totalAmount?.toFixed(0)} <span className="text-night-600 text-xs font-normal">(₹{order.deliveryFee} your share)</span></span>
                <button onClick={()=>handleSelfAssign(order.id)} disabled={actionLoading===order.id} className="btn-ember text-sm py-2">
                  {actionLoading===order.id?'Assigning...':'Accept Order'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* HISTORY tab */}
      {tab===TAB.HISTORY && (
        <div className="space-y-3">
          {history.length===0 ? (
            <div className="card p-12 text-center text-night-500">No delivery history yet</div>
          ) : history.map(order => (
            <div key={order.id} className="card p-4 flex items-center gap-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${order.status==='DELIVERED'?'bg-emerald-500/10':'bg-red-500/10'}`}>
                {order.status==='DELIVERED'?<CheckCircle className="w-5 h-5 text-emerald-400"/>:<AlertCircle className="w-5 h-5 text-red-400"/>}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-night-200 text-sm">Order #{order.id}</p>
                <p className="text-night-500 text-xs">{order.restaurantName} → {order.customerName}</p>
                <p className="text-night-600 text-xs">{order.deliveredAt ? new Date(order.deliveredAt).toLocaleString() : new Date(order.createdAt).toLocaleString()}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <span className={order.status==='DELIVERED'?'badge-green':'badge-red'}>{order.status}</span>
                {order.status==='DELIVERED' && <p className="text-emerald-400 font-bold text-sm mt-1">+₹{order.deliveryFee}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
