import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { ShoppingCart, User, LogOut, Menu, X, Flame, Package, Store, LayoutDashboard, Bike, Settings, Heart, Sun, Moon, UserCircle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { useTheme } from '../context/ThemeContext'

const NAV_LINKS = {
  CUSTOMER:         [{ to:'/', label:'Discover', icon:Flame }, { to:'/orders', label:'My Orders', icon:Package }, { to:'/favorites', label:'Favorites', icon:Heart }],
  RESTAURANT_OWNER: [{ to:'/owner/dashboard', label:'Dashboard', icon:LayoutDashboard }, { to:'/owner/restaurants', label:'My Restaurants', icon:Store }],
  DELIVERY_AGENT:   [{ to:'/agent', label:'Deliveries', icon:Bike }],
  ADMIN:            [{ to:'/admin', label:'Control Center', icon:Settings }, { to:'/', label:'Browse', icon:Flame }],
}

export default function Navbar() {
  const { user, logout } = useAuth()
  const { itemCount } = useCart()
  const { theme, toggleTheme, isDark } = useTheme()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [open, setOpen] = useState(false)

  const links = user ? (NAV_LINKS[user.role] || []) : []

  const ROLE_COLORS = {
    CUSTOMER:'text-emerald-400',
    RESTAURANT_OWNER:'text-blue-400',
    DELIVERY_AGENT:'text-purple-400',
    ADMIN:'text-ember-400'
  }
  const roleColor = user ? ROLE_COLORS[user.role] : ''

  return (
    <nav className="sticky top-0 z-50 glass border-b" style={{ borderColor: 'var(--bg-glass-border)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="relative">
              <div className="w-9 h-9 bg-ember-500 rounded-xl flex items-center justify-center shadow-lg shadow-ember-500/30 group-hover:shadow-ember-500/50 transition-shadow">
                <Flame className="w-5 h-5" style={{ color: '#1a1109' }} />
              </div>
              <div className="absolute inset-0 bg-ember-500 rounded-xl blur-lg opacity-30 group-hover:opacity-50 transition-opacity" />
            </div>
            <span className="font-display text-xl font-bold text-ember-gradient">FoodDash</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {links.map(link => {
              const active = pathname === link.to
              return (
                <Link key={link.to} to={link.to}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${active ? 'bg-ember-500/15 text-ember-400 border border-ember-500/20' : ''}`}
                  style={!active ? { color: 'var(--text-secondary)' } : {}}
                  onMouseEnter={e => { if(!active) { e.currentTarget.style.color='var(--text-primary)'; e.currentTarget.style.background='rgba(255,152,0,0.06)' }}}
                  onMouseLeave={e => { if(!active) { e.currentTarget.style.color='var(--text-secondary)'; e.currentTarget.style.background='' }}}
                >
                  <link.icon className="w-4 h-4" />{link.label}
                </Link>
              )
            })}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl transition-all duration-200 hover:bg-ember-500/10"
              style={{ color: 'var(--text-muted)' }}
              title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDark
                ? <Sun className="w-5 h-5 text-amber-400" />
                : <Moon className="w-5 h-5 text-indigo-500" />
              }
            </button>

            {user?.role === 'CUSTOMER' && (
              <Link to="/cart" className="relative p-2 transition-colors" style={{ color: 'var(--text-muted)' }}
                onMouseEnter={e => e.currentTarget.style.color='#ff9800'}
                onMouseLeave={e => e.currentTarget.style.color='var(--text-muted)'}
              >
                <ShoppingCart className="w-5 h-5" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-ember-500 text-xs font-bold rounded-full flex items-center justify-center animate-bounce" style={{ color: '#1a1109' }}>
                    {itemCount}
                  </span>
                )}
              </Link>
            )}

            {user ? (
              <div className="flex items-center gap-2">
                <Link to="/profile" className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all hover:border-ember-500/30"
                  style={{ background: 'var(--bg-input)', borderColor: 'var(--bg-input-border)' }}
                >
                  {user.picture
                    ? <img src={user.picture} alt="" className="w-6 h-6 rounded-full object-cover" />
                    : <div className="w-6 h-6 bg-ember-500/15 border border-ember-500/20 rounded-full flex items-center justify-center">
                        <User className="w-3 h-3 text-ember-400" />
                      </div>
                  }
                  <div className="text-left">
                    <p className="text-xs font-semibold leading-none" style={{ color: 'var(--text-primary)' }}>{user.name}</p>
                    <p className={`text-xs ${roleColor} leading-none mt-0.5`}>{user.role.replace('_',' ')}</p>
                  </div>
                </Link>
                <button
                  onClick={() => { logout(); navigate('/login') }}
                  className="p-2 rounded-xl transition-all hover:bg-red-500/10 hover:text-red-400"
                  style={{ color: 'var(--text-muted)' }}
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="btn-ghost text-sm py-2">Login</Link>
                <Link to="/register" className="btn-ember text-sm py-2">Get Started</Link>
              </div>
            )}

            <button onClick={() => setOpen(!open)} className="md:hidden p-2" style={{ color: 'var(--text-muted)' }}>
              {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {open && (
          <div className="md:hidden py-3 border-t animate-fade-in" style={{ borderColor: 'var(--bg-input-border)' }}>
            {links.map(link => (
              <Link key={link.to} to={link.to} onClick={() => setOpen(false)}
                className="flex items-center gap-2 px-4 py-3 text-sm rounded-lg transition-colors hover:text-ember-400 hover:bg-ember-500/5"
                style={{ color: 'var(--text-secondary)' }}
              >
                <link.icon className="w-4 h-4" />{link.label}
              </Link>
            ))}
            {user && (
              <Link to="/profile" onClick={() => setOpen(false)}
                className="flex items-center gap-2 px-4 py-3 text-sm rounded-lg transition-colors hover:text-ember-400 hover:bg-ember-500/5"
                style={{ color: 'var(--text-secondary)' }}
              >
                <UserCircle className="w-4 h-4" /> Profile
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}
