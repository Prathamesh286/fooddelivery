import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { TrendingUp, Package, Store, Clock, CheckCircle, ChefHat, Bike, IndianRupee, RefreshCw } from 'lucide-react'
import { restaurantApi, orderApi } from '../services/api'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

const NEXT = { PENDING:'confirm', CONFIRMED:'prepare', PREPARING:'ready' }
const NEXT_LABEL = { PENDING:'Confirm Order', CONFIRMED:'Start Preparing', PREPARING:'Ready for Pickup' }
const STATUS_BADGE = { PENDING:'badge-yellow', CONFIRMED:'badge-blue', PREPARING:'badge-ember', READY_FOR_PICKUP:'badge-purple', OUT_FOR_DELIVERY:'badge-purple', DELIVERED:'badge-green', CANCELLED:'badge-red' }

export default function OwnerDashboard() {
  const { user } = useAuth()
  const [restaurants, setRestaurants] = useState([])
  const [orders, setOrders] = useState([])
  const [selectedR, setSelectedR] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { load() }, [])
  const load = async () => {
    try {
      const res = await restaurantApi.getMy()
      setRestaurants(res.data)
      if(res.data.length>0) { setSelectedR(res.data[0]); loadOrders(res.data[0].id) }
    } catch { toast.error('Failed') } finally { setLoading(false) }
  }
  const loadOrders = async rid => {
    try { const r = await orderApi.getRestaurantOrders(rid); setOrders(r.data) } catch {}
  }
  const handleAction = async (orderId, action) => {
    try {
      await orderApi[action](orderId)
      toast.success('Order updated')
      loadOrders(selectedR.id)
    } catch(e) { toast.error(e.response?.data?.message||'Failed') }
  }

  const active = orders.filter(o=>!['DELIVERED','CANCELLED'].includes(o.status))
  const revenue = orders.filter(o=>o.status==='DELIVERED').reduce((s,o)=>s+o.totalAmount,0)

  if(loading) return <div className="p-8 text-center text-night-500">Loading...</div>

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-2xl font-bold text-night-50">Dashboard</h1>
          <p className="text-night-500 text-sm">Welcome back, {user?.name}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={()=>selectedR&&loadOrders(selectedR.id)} className="btn-ghost text-sm py-2 gap-1"><RefreshCw className="w-3.5 h-3.5"/>Refresh</button>
          <Link to="/owner/restaurants" className="btn-ember text-sm py-2"><Store className="w-4 h-4"/>Manage</Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { icon:Store, v:restaurants.length, l:'Restaurants', c:'text-blue-400', bg:'bg-blue-500/10 border-blue-500/15' },
          { icon:Package, v:orders.length, l:'Total Orders', c:'text-ember-400', bg:'bg-ember-500/10 border-ember-500/15' },
          { icon:Clock, v:active.length, l:'Active', c:'text-yellow-400', bg:'bg-yellow-500/10 border-yellow-500/15' },
          { icon:IndianRupee, v:`₹${revenue.toFixed(0)}`, l:'Revenue', c:'text-emerald-400', bg:'bg-emerald-500/10 border-emerald-500/15' },
        ].map(s => (
          <div key={s.l} className={`card border ${s.bg} p-5`}>
            <s.icon className={`w-7 h-7 ${s.c} mb-3`}/>
            <p className="text-2xl font-bold text-night-50">{s.v}</p>
            <p className="text-night-500 text-xs mt-0.5">{s.l}</p>
          </div>
        ))}
      </div>

      {/* Restaurant selector */}
      {restaurants.length>1 && (
        <div className="flex gap-2 mb-6">
          {restaurants.map(r => (
            <button key={r.id} onClick={()=>{setSelectedR(r);loadOrders(r.id)}}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${selectedR?.id===r.id?'bg-ember-500 text-night-950':'bg-night-800 text-night-400 border border-night-700 hover:border-night-600'}`}>
              {r.name}
            </button>
          ))}
        </div>
      )}

      {/* Active orders */}
      <div>
        <h2 className="font-semibold text-night-200 text-lg mb-4">Active Orders ({active.length})</h2>
        {active.length===0 ? (
          <div className="card p-12 text-center"><Package className="w-10 h-10 text-night-700 mx-auto mb-3"/><p className="text-night-500">No active orders right now</p></div>
        ) : (
          <div className="space-y-3">
            {active.map(order => (
              <div key={order.id} className="card p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <span className="font-bold text-night-100">Order #{order.id}</span>
                    <span className="text-night-500 text-sm ml-2">by {order.customerName}</span>
                    <p className="text-night-600 text-xs mt-0.5">{new Date(order.createdAt).toLocaleString()}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={STATUS_BADGE[order.status]||'badge'}>{order.status.replace('_',' ')}</span>
                    {NEXT[order.status] && (
                      <button onClick={()=>handleAction(order.id, NEXT[order.status])} className="btn-ember py-1.5 px-3 text-xs">
                        {NEXT_LABEL[order.status]}
                      </button>
                    )}
                  </div>
                </div>
                <p className="text-night-400 text-sm mb-3">{order.orderItems?.map(i=>`${i.menuItemName} ×${i.quantity}`).join(' • ')}</p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-night-500 text-xs">📍 {order.deliveryAddress}</span>
                  <div className="flex items-center gap-3">
                    {order.deliveryAgentName && <span className="text-purple-400 text-xs flex items-center gap-1"><Bike className="w-3 h-3"/>{order.deliveryAgentName}</span>}
                    <span className="font-bold text-ember-400">₹{order.totalAmount?.toFixed(0)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
