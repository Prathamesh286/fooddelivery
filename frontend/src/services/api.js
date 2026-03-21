import axios from 'axios'
const api = axios.create({ baseURL: '/api', headers: { 'Content-Type': 'application/json' } })
api.interceptors.request.use(c => { const t = localStorage.getItem('token'); if(t) c.headers.Authorization = `Bearer ${t}`; return c; })
api.interceptors.response.use(r=>r, e => { if(e.response?.status===401){ localStorage.clear(); window.location.href='/login'; } return Promise.reject(e); })
export const authApi = {
  register: d=>api.post('/auth/register',d),
  login: d=>api.post('/auth/login',d),
  me: ()=>api.get('/auth/me'),
  googleLogin: d=>api.post('/auth/google',d), // Backend endpoint for Google token validation
}
export const restaurantApi = { getAll: s=>api.get('/restaurants',{params:s?{search:s}:{}}), getById: id=>api.get(`/restaurants/${id}`), getMy: ()=>api.get('/restaurants/my'), create: d=>api.post('/restaurants',d), update: (id,d)=>api.put(`/restaurants/${id}`,d), toggle: id=>api.patch(`/restaurants/${id}/toggle`) }
export const menuApi = { getByRestaurant: id=>api.get(`/menu/restaurant/${id}`), add: (rid,d)=>api.post(`/menu/restaurant/${rid}`,d), update: (id,d)=>api.put(`/menu/${id}`,d), toggle: id=>api.patch(`/menu/${id}/toggle`), delete: id=>api.delete(`/menu/${id}`) }
export const orderApi = {
  place: d=>api.post('/orders',d),
  getMy: ()=>api.get('/orders/my'),
  getById: id=>api.get(`/orders/${id}`),
  getRestaurantOrders: rid=>api.get(`/orders/restaurant/${rid}`),
  getAll: ()=>api.get('/orders/all'),
  cancel: id=>api.patch(`/orders/${id}/cancel`),
  confirm: id=>api.patch(`/orders/${id}/confirm`),
  prepare: id=>api.patch(`/orders/${id}/prepare`),
  ready: id=>api.patch(`/orders/${id}/ready`),
  adminStatus: (id,s)=>api.patch(`/orders/${id}/status`,null,{params:{status:s}}),
  getAgentOrders: ()=>api.get('/orders/agent/my'),
  getAvailablePickups: ()=>api.get('/orders/agent/available'),
  pickup: id=>api.patch(`/orders/${id}/pickup`),
  selfAssign: id=>api.patch(`/orders/${id}/self-assign`),
  deliver: (id,otp)=>api.patch(`/orders/${id}/deliver`,null,{params:{otp}}),
}
export const reviewApi = { add: d=>api.post('/reviews',d), getByRestaurant: id=>api.get(`/reviews/restaurant/${id}`) }

// Razorpay Payment API
export const paymentApi = {
  createOrder: (orderId) => api.post('/payment/create-order', { orderId }),
  verify: (data) => api.post('/payment/verify', data),
}

// Favorites helpers (localStorage-based, no backend needed)
export const favoritesApi = {
  getAll: () => { try { return JSON.parse(localStorage.getItem('favorites')) || [] } catch { return [] } },
  add: (restaurant) => {
    const favs = favoritesApi.getAll()
    if (!favs.find(f => f.id === restaurant.id)) {
      const updated = [...favs, restaurant]
      localStorage.setItem('favorites', JSON.stringify(updated))
    }
  },
  remove: (id) => {
    const updated = favoritesApi.getAll().filter(f => f.id !== id)
    localStorage.setItem('favorites', JSON.stringify(updated))
  },
  isFavorite: (id) => favoritesApi.getAll().some(f => f.id === id),
}

// Promo codes
export const promoCodes = {
  'WELCOME10': { type: 'percent', value: 10, label: '10% off' },
  'FLAT50': { type: 'flat', value: 50, label: '₹50 off' },
  'FIRST20': { type: 'percent', value: 20, label: '20% off first order' },
}
export const applyPromo = (code, subtotal) => {
  const promo = promoCodes[code?.toUpperCase()]
  if (!promo) return { error: 'Invalid promo code' }
  const discount = promo.type === 'percent' ? (subtotal * promo.value / 100) : promo.value
  return { discount: Math.min(discount, subtotal), label: promo.label }
}

export default api
