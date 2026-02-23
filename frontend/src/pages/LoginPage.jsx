import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Flame, Eye, EyeOff, ArrowRight, Zap } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

const DEMOS = [
  { label: 'Customer', email: 'customer@food.com', password: 'customer123', color: 'text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10', emoji:'🛒' },
  { label: 'Owner', email: 'owner@food.com', password: 'owner123', color: 'text-blue-400 border-blue-500/30 hover:bg-blue-500/10', emoji:'🏪' },
  { label: 'Agent', email: 'agent@food.com', password: 'agent123', color: 'text-purple-400 border-purple-500/30 hover:bg-purple-500/10', emoji:'🚴' },
  { label: 'Admin', email: 'admin@food.com', password: 'admin123', color: 'text-ember-400 border-ember-500/30 hover:bg-ember-500/10', emoji:'⚡' },
]
const REDIRECT = { CUSTOMER:'/', RESTAURANT_OWNER:'/owner/dashboard', DELIVERY_AGENT:'/agent', ADMIN:'/admin' }

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true)
    try {
      const user = await login(form.email, form.password)
      toast.success(`Welcome back, ${user.name}! 🔥`)
      navigate(REDIRECT[user.role] || '/')
    } catch (err) { toast.error(err.response?.data?.message || 'Invalid credentials') }
    finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-ember-500/8 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-ember-700/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10 animate-slide-up">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-ember-500 rounded-2xl shadow-2xl shadow-ember-500/40 mb-4 relative">
            <Flame className="w-8 h-8 text-night-950" />
            <div className="absolute inset-0 bg-ember-400 rounded-2xl blur-xl opacity-40" />
          </div>
          <h1 className="font-display text-4xl font-bold text-ember-gradient mb-1">FoodDash</h1>
          <p className="text-night-400 text-sm">Sign in to continue your foodie journey</p>
        </div>

        <div className="card p-8 relative noise">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-ember-500/40 to-transparent" />

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label">Email address</label>
              <input type="email" className="input" placeholder="you@example.com" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} required />
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input type={showPwd?'text':'password'} className="input pr-10" placeholder="••••••••" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} required />
                <button type="button" onClick={()=>setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-night-500 hover:text-night-300">
                  {showPwd ? <EyeOff className="w-4 h-4"/> : <Eye className="w-4 h-4"/>}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-ember w-full py-3">
              {loading ? <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-night-950/30 border-t-night-950 rounded-full animate-spin"/>Signing in...</span>
                : <><span>Sign In</span><ArrowRight className="w-4 h-4"/></>}
            </button>
          </form>

          <div className="mt-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 h-px bg-night-800"/><span className="text-xs text-night-600 font-medium flex items-center gap-1"><Zap className="w-3 h-3"/>Login as</span><div className="flex-1 h-px bg-night-800"/>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {DEMOS.map(d => (
                <button key={d.email} onClick={()=>setForm({email:d.email,password:d.password})}
                  className={`border rounded-xl px-3 py-2 text-xs font-semibold transition-all duration-200 ${d.color}`}>
                  {d.emoji} {d.label}
                </button>
              ))}
            </div>
          </div>

          <p className="text-center text-sm text-night-500 mt-5">
            New here?{' '}<Link to="/register" className="text-ember-400 font-semibold hover:text-ember-300 transition-colors">Create account →</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
