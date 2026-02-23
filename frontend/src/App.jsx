import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import Navbar from './components/Navbar'
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

function Layout({ children }) {
  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(to bottom, #0d0805 0%, #120a04 100%)' }}>
      <Navbar />
      <main className="pb-20">{children}</main>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Toaster
            position="top-right"
            toastOptions={{
              style: { borderRadius:'14px', background:'#2a1f18', color:'#f8f7f6', fontFamily:"'Outfit',sans-serif", fontSize:'14px', border:'1px solid rgba(255,152,0,0.15)', boxShadow:'0 20px 40px rgba(0,0,0,0.4)' },
              success: { iconTheme:{ primary:'#ff9800', secondary:'#0d0805' } },
              error: { iconTheme:{ primary:'#ef4444', secondary:'#0d0805' } },
            }}
          />
          <Routes>
            <Route path="/login" element={<LoginPage/>}/>
            <Route path="/register" element={<RegisterPage/>}/>
            <Route path="/" element={<Layout><HomePage/></Layout>}/>
            <Route path="/restaurant/:id" element={<Layout><RestaurantPage/></Layout>}/>
            <Route path="/cart" element={<Layout><ProtectedRoute roles={['CUSTOMER']}><CartPage/></ProtectedRoute></Layout>}/>
            <Route path="/orders" element={<Layout><ProtectedRoute roles={['CUSTOMER']}><OrdersPage/></ProtectedRoute></Layout>}/>
            <Route path="/owner/dashboard" element={<Layout><ProtectedRoute roles={['RESTAURANT_OWNER','ADMIN']}><OwnerDashboard/></ProtectedRoute></Layout>}/>
            <Route path="/owner/restaurants" element={<Layout><ProtectedRoute roles={['RESTAURANT_OWNER','ADMIN']}><OwnerRestaurantsPage/></ProtectedRoute></Layout>}/>
            <Route path="/agent" element={<Layout><ProtectedRoute roles={['DELIVERY_AGENT']}><AgentPage/></ProtectedRoute></Layout>}/>
            <Route path="/admin" element={<Layout><ProtectedRoute roles={['ADMIN']}><AdminPage/></ProtectedRoute></Layout>}/>
            <Route path="*" element={<Navigate to="/"/>}/>
          </Routes>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
