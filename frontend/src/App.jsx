import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import { ThemeProvider, useTheme } from './context/ThemeContext'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ProtectedRoute from './components/ProtectedRoute'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import HomePage from './pages/HomePage'
import RestaurantPage from './pages/RestaurantPage'
import CartPage from './pages/CartPage'
import OrdersPage from './pages/OrdersPage'
import OwnerDashboard from './pages/OwnerDashboard'
import OwnerRestaurantsPage from './pages/OwnerRestaurantsPage'
import AgentPage from './pages/AgentPage'
import AdminPage from './pages/AdminPage'
import TrackOrderPage from './pages/TrackOrderPage'
import FavoritesPage from './pages/FavoritesPage'
import ProfilePage from './pages/ProfilePage'

function Layout({ children, hideFooter = false }) {
  const { isDark } = useTheme()
  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: isDark
        ? 'linear-gradient(to bottom, #0d0805 0%, #120a04 100%)'
        : 'linear-gradient(to bottom, #faf8f5 0%, #f5f0e8 100%)'
      }}
    >
      <Navbar />
      <main className="flex-1 pb-8">{children}</main>
      {!hideFooter && <Footer />}
    </div>
  )
}

function AppInner() {
  const { isDark } = useTheme()
  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            borderRadius: '14px',
            background: isDark ? '#2a1f18' : '#fff',
            color: isDark ? '#f8f7f6' : '#1a1109',
            fontFamily: "'Outfit', sans-serif",
            fontSize: '14px',
            border: isDark ? '1px solid rgba(255,152,0,0.15)' : '1px solid rgba(255,152,0,0.3)',
            boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
          },
          success: { iconTheme: { primary: '#ff9800', secondary: isDark ? '#0d0805' : '#fff' } },
          error:   { iconTheme: { primary: '#ef4444', secondary: isDark ? '#0d0805' : '#fff' } },
        }}
      />
      <Routes>
        <Route path="/login"    element={<Layout hideFooter><LoginPage /></Layout>} />
        <Route path="/register" element={<Layout hideFooter><RegisterPage /></Layout>} />
        <Route path="/"              element={<Layout><HomePage /></Layout>} />
        <Route path="/restaurant/:id" element={<Layout><RestaurantPage /></Layout>} />
        <Route path="/cart"   element={<Layout><ProtectedRoute roles={['CUSTOMER']}><CartPage /></ProtectedRoute></Layout>} />
        <Route path="/orders" element={<Layout><ProtectedRoute roles={['CUSTOMER']}><OrdersPage /></ProtectedRoute></Layout>} />
        <Route path="/orders/:id/track" element={<Layout><ProtectedRoute roles={['CUSTOMER']}><TrackOrderPage /></ProtectedRoute></Layout>} />
        <Route path="/favorites" element={<Layout><ProtectedRoute roles={['CUSTOMER']}><FavoritesPage /></ProtectedRoute></Layout>} />
        <Route path="/profile" element={<Layout><ProtectedRoute roles={['CUSTOMER','RESTAURANT_OWNER','DELIVERY_AGENT','ADMIN']}><ProfilePage /></ProtectedRoute></Layout>} />
        <Route path="/owner/dashboard"   element={<Layout><ProtectedRoute roles={['RESTAURANT_OWNER','ADMIN']}><OwnerDashboard /></ProtectedRoute></Layout>} />
        <Route path="/owner/restaurants" element={<Layout><ProtectedRoute roles={['RESTAURANT_OWNER','ADMIN']}><OwnerRestaurantsPage /></ProtectedRoute></Layout>} />
        <Route path="/agent" element={<Layout><ProtectedRoute roles={['DELIVERY_AGENT']}><AgentPage /></ProtectedRoute></Layout>} />
        <Route path="/admin" element={<Layout><ProtectedRoute roles={['ADMIN']}><AdminPage /></ProtectedRoute></Layout>} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <CartProvider>
            <AppInner />
          </CartProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}
