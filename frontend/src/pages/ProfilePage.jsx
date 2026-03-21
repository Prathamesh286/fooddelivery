import React, { useState } from 'react'
import { User, Mail, Phone, MapPin, Edit3, Save, X, LogOut, Shield } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

const ROLE_COLORS = {
  CUSTOMER: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  RESTAURANT_OWNER: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  DELIVERY_AGENT: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
  ADMIN: 'text-ember-400 bg-ember-500/10 border-ember-500/20',
}
const ROLE_ICONS = { CUSTOMER:'🛒', RESTAURANT_OWNER:'🏪', DELIVERY_AGENT:'🚴', ADMIN:'⚡' }

export default function ProfilePage() {
  const { user, logout } = useAuth()
  const { theme, toggleTheme, isDark } = useTheme()
  const navigate = useNavigate()
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ name: user?.name || '', phone: '', address: '' })

  const handleSave = () => {
    // In production, call an API to update profile
    toast.success('Profile updated!')
    setEditing(false)
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  if (!user) return null

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="font-display text-3xl font-bold mb-8" style={{ color: 'var(--text-primary)' }}>My Profile</h1>

      {/* Avatar + role */}
      <div className="card p-6 mb-6">
        <div className="flex items-start gap-4">
          <div className="relative flex-shrink-0">
            {user.picture
              ? <img src={user.picture} alt={user.name} className="w-20 h-20 rounded-2xl object-cover ring-2 ring-ember-500/30" />
              : <div className="w-20 h-20 bg-ember-500/15 border border-ember-500/20 rounded-2xl flex items-center justify-center">
                  <User className="w-10 h-10 text-ember-400" />
                </div>
            }
            {user.googleAuth && (
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-md">
                <svg width="14" height="14" viewBox="0 0 18 18">
                  <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18z"/>
                  <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2a4.8 4.8 0 0 1-7.18-2.54H1.83v2.07A8 8 0 0 0 8.98 17z"/>
                  <path fill="#FBBC05" d="M4.5 10.52a4.8 4.8 0 0 1 0-3.04V5.41H1.83a8 8 0 0 0 0 7.18l2.67-2.07z"/>
                  <path fill="#EA4335" d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 0 0 1.83 5.4L4.5 7.49a4.77 4.77 0 0 1 4.48-3.3z"/>
                </svg>
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold truncate" style={{ color: 'var(--text-primary)' }}>{user.name}</h2>
            <p className="text-sm mb-2 truncate" style={{ color: 'var(--text-muted)' }}>{user.email}</p>
            <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border ${ROLE_COLORS[user.role]}`}>
              {ROLE_ICONS[user.role]} {user.role?.replace('_', ' ')}
            </span>
            {user.googleAuth && (
              <span className="ml-2 inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border border-blue-500/20 bg-blue-500/10 text-blue-400">
                🔗 Google
              </span>
            )}
          </div>
          <button onClick={() => setEditing(!editing)} className="p-2 rounded-xl transition-all hover:bg-ember-500/10 flex-shrink-0"
            style={{ color: 'var(--text-muted)' }}>
            {editing ? <X className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Edit form */}
      {editing ? (
        <div className="card p-6 mb-6">
          <h3 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Edit Profile</h3>
          <div className="space-y-4">
            <div>
              <label className="label">Full Name</label>
              <input className="input" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} />
            </div>
            <div>
              <label className="label">Phone Number</label>
              <input className="input" type="tel" placeholder="+91 98765 43210" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} />
            </div>
            <div>
              <label className="label">Delivery Address</label>
              <textarea className="input resize-none" rows={3} placeholder="Your default delivery address..." value={form.address} onChange={e=>setForm({...form,address:e.target.value})} />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={handleSave} className="btn-ember flex-1">
              <Save className="w-4 h-4" /> Save Changes
            </button>
            <button onClick={() => setEditing(false)} className="btn-ghost flex-1">Cancel</button>
          </div>
        </div>
      ) : null}

      {/* Settings */}
      <div className="card p-6 mb-6">
        <h3 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Preferences</h3>
        <div className="flex items-center justify-between py-3 border-b" style={{ borderColor: 'var(--bg-input-border)' }}>
          <div>
            <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Dark Mode</p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Toggle light / dark theme</p>
          </div>
          <button
            onClick={toggleTheme}
            className={`relative w-12 h-6 rounded-full transition-all duration-300 ${isDark ? 'bg-ember-500' : 'bg-gray-300'}`}
          >
            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all duration-300 ${isDark ? 'left-7' : 'left-1'}`} />
          </button>
        </div>
        <div className="flex items-center justify-between py-3">
          <div>
            <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Notifications</p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Order updates and promotions</p>
          </div>
          <button className="relative w-12 h-6 rounded-full bg-ember-500">
            <div className="absolute top-1 left-7 w-4 h-4 bg-white rounded-full shadow" />
          </button>
        </div>
      </div>

      {/* Danger zone */}
      <div className="card p-6">
        <h3 className="font-semibold mb-4 text-red-400">Account</h3>
        <button onClick={handleLogout} className="btn-danger w-full flex items-center justify-center gap-2">
          <LogOut className="w-4 h-4" /> Sign Out
        </button>
      </div>
    </div>
  )
}
