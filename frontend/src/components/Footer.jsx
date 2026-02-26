import React from 'react'
import { Link } from 'react-router-dom'
import { Flame, MapPin, Phone, Mail, Instagram, Twitter, Facebook, Youtube, ArrowUpRight } from 'lucide-react'

const LINKS = {
  Discover: [
    { label: 'All Restaurants', to: '/restaurants' },

  ],
  Account: [
    { label: 'My Orders', to: '/orders' },
    { label: 'My Cart', to: '/cart' },
    { label: 'Login', to: '/login' },
    { label: 'Register', to: '/register' },
  ],
  Partners: [
    { label: 'List Your Restaurant', to: '/register' },
    { label: 'Become a Delivery Agent', to: '/register' },
    { label: 'Owner Dashboard', to: '/owner/dashboard' },
  ],
  Support: [
    { label: 'Help Center', to: '/' },
    { label: 'Contact Us', to: '/' },
    { label: 'Privacy Policy', to: '/' },
    { label: 'Terms of Service', to: '/' },
  ],
}

const SOCIALS = [
  { icon: Instagram, label: 'Instagram', href: '#' },
  { icon: Twitter,   label: 'Twitter',   href: '#' },
  { icon: Facebook,  label: 'Facebook',  href: '#' },
  { icon: Youtube,   label: 'YouTube',   href: '#' },
]

const CONTACT = [
  { icon: MapPin, text: 'Pune, Maharashtra, India' },
  { icon: Phone,  text: '+91 98765 43210' },
  { icon: Mail,   text: 'hello@foodDash.in' },
]


export default function Footer() {
  return (
    <footer className="relative mt-20 overflow-hidden">
      {/* Top glow border */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-ember-500/60 to-transparent" />

      {/* Ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-40 bg-ember-500/6 rounded-full blur-3xl pointer-events-none" />

      <div
        className="relative"
        style={{ background: 'linear-gradient(to bottom, #120a04 0%, #0d0805 100%)' }}
      >
        
        {/* ── Main footer grid ────────────────────────────────────────────── */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-6">

            {/* Contact column — takes 1 extra col on lg */}
            <div className="col-span-2 sm:col-span-2 lg:col-span-1">
              <h4 className="text-xs font-bold tracking-widest text-ember-500 uppercase mb-4">Get in Touch</h4>
              <ul className="space-y-3">
                {CONTACT.map(({ icon: Icon, text }) => (
                  <li key={text} className="flex items-start gap-2.5 text-night-400 text-sm">
                    <Icon className="w-4 h-4 text-ember-500/70 mt-0.5 flex-shrink-0" />
                    <span>{text}</span>
                  </li>
                ))}
              </ul>

              {/* Socials */}
              <div className="flex items-center gap-2 mt-6">
                {SOCIALS.map(({ icon: Icon, label, href }) => (
                  <a
                    key={label}
                    href={href}
                    aria-label={label}
                    className="w-8 h-8 flex items-center justify-center rounded-lg bg-night-800 border border-night-700 text-night-500 hover:text-ember-400 hover:border-ember-500/40 hover:bg-ember-500/5 transition-all duration-200"
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </a>
                ))}
              </div>
            </div>

            {/* Link columns */}
            {Object.entries(LINKS).map(([heading, links]) => (
              <div key={heading} className="col-span-1">
                <h4 className="text-xs font-bold tracking-widest text-ember-500 uppercase mb-4">{heading}</h4>
                <ul className="space-y-2.5">
                  {links.map(({ label, to }) => (
                    <li key={label}>
                      <Link
                        to={to}
                        className="text-sm text-night-500 hover:text-night-200 transition-colors duration-200 flex items-center gap-1 group"
                      >
                        <span>{label}</span>
                        <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-60 transition-opacity -translate-y-0.5 flex-shrink-0" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* ── App download strip ──────────────────────────────────────────── */}
        <div className="border-t border-night-800/60">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-night-500 text-sm text-center sm:text-left">
                FoodDash app coming soon on iOS & Android
              </p>
              <div className="flex items-center gap-3">
                <button className="flex items-center gap-2 px-4 py-2 bg-night-800 border border-night-700 rounded-xl text-xs text-night-300 hover:border-ember-500/30 hover:text-ember-400 transition-all">
                  <span className="text-base"></span> App Store
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-night-800 border border-night-700 rounded-xl text-xs text-night-300 hover:border-ember-500/30 hover:text-ember-400 transition-all">
                  <span className="text-base"></span> Google Play
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── Bottom bar ──────────────────────────────────────────────────── */}
        <div className="border-t border-night-800/40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-night-600">
              <p>© {new Date().getFullYear()} FoodDash. All rights reserved.</p>
              
              <div className="flex items-center gap-4">
                <Link to="/" className="hover:text-night-400 transition-colors">Privacy</Link>
                <Link to="/" className="hover:text-night-400 transition-colors">Terms</Link>
                <Link to="/" className="hover:text-night-400 transition-colors"></Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}