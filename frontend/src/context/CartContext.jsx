import React, { createContext, useContext, useState } from 'react'
const CartContext = createContext(null)
export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([])
  const [restaurantId, setRestaurantId] = useState(null)
  const [restaurantName, setRestaurantName] = useState('')
  const addToCart = (item, rId, rName) => {
    if (restaurantId && restaurantId !== rId) {
      if (!window.confirm('Remove existing cart items and add from new restaurant?')) return
      setCart([])
    }
    setRestaurantId(rId); setRestaurantName(rName)
    setCart(prev => {
      const ex = prev.find(c => c.id === item.id)
      return ex ? prev.map(c => c.id===item.id ? {...c, quantity: c.quantity+1} : c) : [...prev, {...item, quantity:1}]
    })
  }
  const removeFromCart = (itemId) => {
    setCart(prev => {
      const updated = prev.map(c => c.id===itemId ? {...c, quantity: c.quantity-1} : c).filter(c => c.quantity > 0)
      if(updated.length===0) { setRestaurantId(null); setRestaurantName('') }
      return updated
    })
  }
  const clearCart = () => { setCart([]); setRestaurantId(null); setRestaurantName('') }
  const total = cart.reduce((s,i) => s + i.price*i.quantity, 0)
  const itemCount = cart.reduce((s,i) => s + i.quantity, 0)
  return <CartContext.Provider value={{ cart, restaurantId, restaurantName, addToCart, removeFromCart, clearCart, total, itemCount }}>{children}</CartContext.Provider>
}
export const useCart = () => { const ctx = useContext(CartContext); if(!ctx) throw new Error('useCart outside provider'); return ctx; }
