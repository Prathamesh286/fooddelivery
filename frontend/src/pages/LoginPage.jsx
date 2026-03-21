import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Flame, Eye, EyeOff, ArrowRight, Zap } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import toast from 'react-hot-toast'

const DEMOS = [
  { label: 'Customer', email: 'customer@food.com', password: 'customer123', color: 'text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10', emoji:'🛒' },
  { label: 'Owner', email: 'owner@food.com', password: 'owner123', color: 'text-blue-400 border-blue-500/30 hover:bg-blue-500/10', emoji:'🏪' },
  { label: 'Agent', email: 'agent@food.com', password: 'agent123', color: 'text-purple-400 border-purple-500/30 hover:bg-purple-500/10', emoji:'🚴' },
  { label: 'Admin', email: 'admin@food.com', password: 'admin123', color: 'text-ember-400 border-ember-500/30 hover:bg-ember-500/10', emoji:'⚡' },
]
const REDIRECT = { CUSTOMER:'/', RESTAURANT_OWNER:'/owner/dashboard', DELIVERY_AGENT:'/agent', ADMIN:'/admin' }

// Replace with your actual Google Client ID
const GOOGLE_CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com'
export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const { login, googleLogin } = useAuth()
  const { isDark } = useTheme()
  const navigate = useNavigate()

  useEffect(() => {
    // Load Google Identity Services
    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    script.onload = () => {
      if (window.google && GOOGLE_CLIENT_ID !== 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com') {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleGoogleCallback,
          auto_select: false,
        })
        window.google.accounts.id.renderButton(
          document.getElementById('google-signin-btn'),
          { theme: isDark ? 'filled_black' : 'outline', size: 'large', width: 340, text: 'signin_with' }
        )
      }
    }
    document.head.appendChild(script)
    return () => { document.head.removeChild(script) }
  }, [isDark])

  const handleGoogleCallback = async (response) => {
    setGoogleLoading(true)
    try {
      const user = await googleLogin(response.credential)
      toast.success(`Welcome, ${user.name}! 🔥`)
      navigate(REDIRECT[user.role] || '/')
    } catch (err) {
      toast.error('Google login failed. Please try again.')
    } finally {
      setGoogleLoading(false)
    }
  }

  const handleGoogleSignIn = () => {
    if (GOOGLE_CLIENT_ID === 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com') {
      toast.error('Configure GOOGLE_CLIENT_ID in LoginPage.jsx to enable Google login')
      return
    }
    if (window.google) {
      window.google.accounts.id.prompt()
    }
  }

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
      {/* Background blobs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-ember-500/8 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-ember-700/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10" style={{ animation: 'slideUp 0.5s cubic-bezier(0.16,1,0.3,1)' }}>
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-ember-500 rounded-2xl shadow-2xl shadow-ember-500/40 mb-4 relative">
            <Flame className="w-8 h-8" style={{ color: '#1a1109' }} />
            <div className="absolute inset-0 bg-ember-400 rounded-2xl blur-xl opacity-40" />
          </div>
          <h1 className="font-display text-4xl font-bold text-ember-gradient mb-1">FoodDash</h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Sign in to continue your foodie journey</p>
        </div>

        <div className="card p-8 relative noise">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-ember-500/40 to-transparent" />

          {/* Google Sign-In */}
          <div className="mb-6">
            <button
              onClick={handleGoogleSignIn}
              disabled={googleLoading}
              className="btn-google"
            >
              {googleLoading ? (
                <span className="w-4 h-4 border-2 border-ember-500/30 border-t-ember-500 rounded-full animate-spin" />
              ) : (
                <svg width="18" height="18" viewBox="0 0 18 18">
                  <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18z"/>
                  <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2a4.8 4.8 0 0 1-7.18-2.54H1.83v2.07A8 8 0 0 0 8.98 17z"/>
                  <path fill="#FBBC05" d="M4.5 10.52a4.8 4.8 0 0 1 0-3.04V5.41H1.83a8 8 0 0 0 0 7.18l2.67-2.07z"/>
                  <path fill="#EA4335" d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 0 0 1.83 5.4L4.5 7.49a4.77 4.77 0 0 1 4.48-3.3z"/>
                </svg>
              )}
              <span>Continue with Google</span>
            </button>
            {/* Hidden container for Google's rendered button (alternative) */}
            <div id="google-signin-btn" className="hidden" />
          </div>

          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px" style={{ background: 'var(--bg-input-border)' }} />
            <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>or sign in with email</span>
            <div className="flex-1 h-px" style={{ background: 'var(--bg-input-border)' }} />
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label">Email address</label>
              <input type="email" className="input" placeholder="you@example.com" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} required />
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input type={showPwd?'text':'password'} className="input pr-10" placeholder="••••••••" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} required />
                <button type="button" onClick={()=>setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {showPwd ? <EyeOff className="w-4 h-4"/> : <Eye className="w-4 h-4"/>}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-ember w-full py-3">
              {loading
                ? <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-night-950/30 border-t-night-950 rounded-full animate-spin"/>Signing in...</span>
                : <><span>Sign In</span><ArrowRight className="w-4 h-4"/></>
              }
            </button>
          </form>

          {/* Demo accounts */}
          <div className="mt-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 h-px" style={{ background: 'var(--bg-input-border)' }} />
              <span className="text-xs font-medium flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
                <Zap className="w-3 h-3"/>Demo accounts
              </span>
              <div className="flex-1 h-px" style={{ background: 'var(--bg-input-border)' }} />
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

          <p className="text-center text-sm mt-5" style={{ color: 'var(--text-muted)' }}>
            New here?{' '}<Link to="/register" className="text-ember-400 font-semibold hover:text-ember-300 transition-colors">Create account →</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
