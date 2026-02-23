import React, { useState, useEffect } from 'react'
import { orderApi, restaurantApi } from '../services/api'
import { Package, Store, TrendingUp, Users, RefreshCw, Settings, ChevronDown } from 'lucide-react'
import toast from 'react-hot-toast'

const STATUS_BADGE = { PENDING:'badge-yellow', CONFIRMED:'badge-blue', PREPARING:'badge-ember', READY_FOR_PICKUP:'badge-purple', OUT_FOR_DELIVERY:'badge-purple', DELIVERED:'badge-green', CANCELLED:'badge-red' }
const ALL_STATUSES = ['PENDING','CONFIRMED','PREPARING','READY_FOR_PICKUP','OUT_FOR_DELIVERY','DELIVERED','CANCELLED']

export default function AdminPage() {
  const [orders, setOrders] = useState([])
  const [restaurants, setRestaurants] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('ALL')
  const [tab, setTab] = useState('orders')

  useEffect(() => { load() }, [])
  const load = async () => {
    setLoading(true)
    try { const [o,r] = await Promise.all([orderApi.getAll(),restaurantApi.getAll()]); setOrders(o.data); setRestaurants(r.data) }
    catch { toast.error('Failed') } finally { setLoading(false) }
  }
  const updateStatus = async (id, status) => {
    try { await orderApi.adminStatus(id, status); toast.success('Status updated'); load() }
    catch { toast.error('Failed') }
  }

  const filtered = filterStatus==='ALL' ? orders : orders.filter(o=>o.status===filterStatus)
  const revenue = orders.filter(o=>o.status==='DELIVERED').reduce((s,o)=>s+o.totalAmount,0)
  const pending = orders.filter(o=>o.status==='PENDING').length

  if (loading) return <div className="p-8 text-center text-night-500">Loading...</div>

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-2xl font-bold text-ember-gradient">Control Center</h1>
          <p className="text-night-500 text-sm">Full platform overview</p>
        </div>
        <button onClick={load} className="btn-ghost text-sm py-2"><RefreshCw className="w-3.5 h-3.5"/>Refresh</button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { icon:Package, v:orders.length, l:'Total Orders', c:'text-ember-400', bg:'bg-ember-500/10 border-ember-500/15' },
          { icon:Store, v:restaurants.length, l:'Restaurants', c:'text-blue-400', bg:'bg-blue-500/10 border-blue-500/15' },
          { icon:TrendingUp, v:`₹${revenue.toFixed(0)}`, l:'Revenue', c:'text-emerald-400', bg:'bg-emerald-500/10 border-emerald-500/15' },
          { icon:Users, v:pending, l:'Pending Orders', c:'text-yellow-400', bg:'bg-yellow-500/10 border-yellow-500/15' },
        ].map(s => (
          <div key={s.l} className={`card border ${s.bg} p-5`}>
            <s.icon className={`w-7 h-7 ${s.c} mb-3`}/>
            <p className="text-2xl font-bold text-night-50">{s.v}</p>
            <p className="text-night-500 text-xs mt-0.5">{s.l}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-night-800/60 border border-night-700 rounded-2xl mb-6 w-fit">
        {[{v:'orders',l:`Orders (${orders.length})`},{v:'restaurants',l:`Restaurants (${restaurants.length})`}].map(t => (
          <button key={t.v} onClick={()=>setTab(t.v)}
            className={`px-6 py-2 rounded-xl text-sm font-semibold transition-all ${tab===t.v?'bg-ember-500 text-night-950 shadow-lg':'text-night-400 hover:text-night-200'}`}>
            {t.l}
          </button>
        ))}
      </div>

      {tab==='orders' && (
        <>
          {/* Status filter */}
          <div className="flex gap-2 flex-wrap mb-5">
            {['ALL',...ALL_STATUSES].map(s => (
              <button key={s} onClick={()=>setFilterStatus(s)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${filterStatus===s?'bg-night-200 text-night-950':'bg-night-800 text-night-500 border border-night-700 hover:border-night-600 hover:text-night-300'}`}>
                {s.replace(/_/g,' ')}
              </button>
            ))}
          </div>
          <div className="space-y-3">
            {filtered.map(order => (
              <div key={order.id} className="card p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-night-100">#{order.id}</span>
                    <span className={STATUS_BADGE[order.status]||'badge'}>{order.status.replace(/_/g,' ')}</span>
                  </div>
                  <span className="text-night-600 text-xs font-mono">{new Date(order.createdAt).toLocaleString()}</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-night-500 mb-3">
                  <span>👤 {order.customerName}</span>
                  <span>🏪 {order.restaurantName}</span>
                  <span>💰 ₹{order.totalAmount?.toFixed(0)}</span>
                  <span>📍 {(order.deliveryAddress||'').substring(0,25)}</span>
                </div>
                {order.deliveryAgentName && <p className="text-purple-400 text-xs mb-2">🚴 Agent: {order.deliveryAgentName}</p>}
                {/* Status buttons */}
                <div className="flex gap-2 flex-wrap">
                  {ALL_STATUSES.filter(s=>s!==order.status).map(s => (
                    <button key={s} onClick={()=>updateStatus(order.id,s)}
                      className="text-xs px-2 py-1 rounded-lg bg-night-800 text-night-400 hover:bg-night-700 hover:text-night-200 border border-night-700 transition-colors">
                      → {s.replace(/_/g,' ')}
                    </button>
                  ))}
                </div>
              </div>
            ))}
            {filtered.length===0 && <div className="text-center py-8 text-night-500">No orders with this status</div>}
          </div>
        </>
      )}

      {tab==='restaurants' && (
        <div className="space-y-3">
          {restaurants.map(r => (
            <div key={r.id} className="card p-4 flex items-center gap-4">
              <img src={r.imageUrl||'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=100'} alt={r.name} className="w-14 h-14 rounded-xl object-cover flex-shrink-0"/>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-night-100">{r.name}</span>
                  <span className={r.open?'badge-green':'badge-red'}>{r.open?'Open':'Closed'}</span>
                </div>
                <p className="text-night-500 text-xs">{r.cuisine} • ⭐ {r.rating} ({r.reviewCount} reviews)</p>
                <p className="text-night-600 text-xs truncate">{r.address}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-ember-400 font-bold text-sm">₹{r.deliveryFee}</p>
                <p className="text-night-600 text-xs">{r.deliveryTime} min</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
