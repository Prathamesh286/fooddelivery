import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Flame, ArrowRight } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
const ROLES = [
  { value:'CUSTOMER', label:'Customer', desc:'Order delicious food', emoji:'🛒' },
  { value:'RESTAURANT_OWNER', label:'Restaurant Owner', desc:'List and manage your restaurant', emoji:'🏪' },
  { value:'DELIVERY_AGENT', label:'Delivery Agent', desc:'Deliver orders and earn', emoji:'🚴' },
]
export default function RegisterPage() {
  const [form, setForm] = useState({ name:'', email:'', password:'', phone:'', address:'', vehicleNumber:'', role:'CUSTOMER' })
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()
  const handleSubmit = async e => {
    e.preventDefault(); setLoading(true)
    try { const u = await register(form); toast.success(`Welcome, ${u.name}! 🎉`); navigate('/') }
    catch(err) { toast.error(err.response?.data?.message||'Registration failed') }
    finally { setLoading(false) }
  }
  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0"><div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-ember-500/6 rounded-full blur-3xl"/></div>
      <div className="w-full max-w-lg relative z-10 animate-slide-up">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-ember-500 rounded-2xl shadow-2xl shadow-ember-500/40 mb-3">
            <Flame className="w-7 h-7 text-night-950"/>
          </div>
          <h1 className="font-display text-3xl font-bold text-ember-gradient mb-1">Join FoodDash</h1>
          <p className="text-night-400 text-sm">Create your account to get started</p>
        </div>
        <div className="card p-8 relative noise">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-ember-500/40 to-transparent"/>
          {/* Role selection */}
          <div className="mb-6">
            <label className="label">I am a...</label>
            <div className="grid grid-cols-3 gap-2">
              {ROLES.map(r => (
                <button type="button" key={r.value} onClick={()=>setForm({...form,role:r.value})}
                  className={`p-3 rounded-xl border text-center transition-all duration-200 ${form.role===r.value ? 'border-ember-500/60 bg-ember-500/10 text-ember-400' : 'border-night-700 text-night-400 hover:border-night-600'}`}>
                  <div className="text-xl mb-1">{r.emoji}</div>
                  <div className="text-xs font-semibold">{r.label}</div>
                </button>
              ))}
            </div>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2"><label className="label">Full Name</label><input className="input" placeholder="John Doe" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} required/></div>
              <div className="col-span-2"><label className="label">Email</label><input type="email" className="input" placeholder="you@example.com" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} required/></div>
              <div><label className="label">Password</label><input type="password" className="input" placeholder="Min 6 chars" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} required minLength={6}/></div>
              <div><label className="label">Phone</label><input className="input" placeholder="9876543210" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})}/></div>
              {form.role==='DELIVERY_AGENT' && (
                <div className="col-span-2"><label className="label">Vehicle Number</label><input className="input" placeholder="MH12AB1234" value={form.vehicleNumber} onChange={e=>setForm({...form,vehicleNumber:e.target.value})}/></div>
              )}
              {form.role!=='DELIVERY_AGENT' && (
                <div className="col-span-2"><label className="label">Address</label><input className="input" placeholder="123 Main St, City" value={form.address} onChange={e=>setForm({...form,address:e.target.value})}/></div>
              )}
            </div>
            <button type="submit" disabled={loading} className="btn-ember w-full py-3 mt-2">
              {loading ? 'Creating account...' : <><span>Create Account</span><ArrowRight className="w-4 h-4"/></>}
            </button>
          </form>
          <p className="text-center text-sm text-night-500 mt-4">Already have an account? <Link to="/login" className="text-ember-400 font-semibold hover:text-ember-300">Sign in →</Link></p>
        </div>
      </div>
    </div>
  )
}
