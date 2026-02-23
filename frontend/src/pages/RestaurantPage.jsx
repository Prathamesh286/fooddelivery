import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Star, Clock, Bike, MapPin, Plus, Minus, ShoppingCart, Leaf, Phone, ChevronLeft } from 'lucide-react'
import { restaurantApi, menuApi, reviewApi } from '../services/api'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

export default function RestaurantPage() {
  const { id } = useParams()
  const [restaurant, setRestaurant] = useState(null)
  const [menu, setMenu] = useState([])
  const [reviews, setReviews] = useState([])
  const [selectedCat, setSelectedCat] = useState('All')
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('menu')
  const [reviewForm, setReviewForm] = useState({ rating:5, comment:'' })
  const { cart, addToCart, removeFromCart, itemCount } = useCart()
  const { user } = useAuth()

  useEffect(() => {
    Promise.all([restaurantApi.getById(id), menuApi.getByRestaurant(id), reviewApi.getByRestaurant(id)])
      .then(([r,m,rev]) => { setRestaurant(r.data); setMenu(m.data); setReviews(rev.data) })
      .catch(() => toast.error('Failed to load'))
      .finally(() => setLoading(false))
  }, [id])

  const categories = ['All', ...new Set(menu.map(i=>i.category).filter(Boolean))]
  const filteredMenu = selectedCat==='All' ? menu : menu.filter(i=>i.category===selectedCat)
  const getQty = itemId => cart.find(c=>c.id===itemId)?.quantity || 0

  const handleReview = async e => {
    e.preventDefault()
    try {
      await reviewApi.add({ restaurantId: parseInt(id), ...reviewForm })
      toast.success('Review posted!')
      const r = await reviewApi.getByRestaurant(id)
      setReviews(r.data)
      setReviewForm({ rating:5, comment:'' })
    } catch { toast.error('Failed') }
  }

  if (loading) return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-4 animate-pulse">
      <div className="h-72 skeleton rounded-2xl"/>
      <div className="h-6 skeleton w-48"/>
    </div>
  )
  if (!restaurant) return <div className="text-center py-20 text-night-500">Restaurant not found</div>

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 animate-fade-in">
      <Link to="/" className="inline-flex items-center gap-1.5 text-night-500 hover:text-ember-400 text-sm mb-4 transition-colors">
        <ChevronLeft className="w-4 h-4"/>Back to restaurants
      </Link>

      {/* Hero */}
      <div className="relative h-72 rounded-3xl overflow-hidden mb-6">
        <img src={restaurant.imageUrl||'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200'} alt={restaurant.name} className="w-full h-full object-cover"/>
        <div className="absolute inset-0 bg-gradient-to-t from-night-950 via-night-950/40 to-transparent"/>
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="flex items-end justify-between">
            <div>
              <h1 className="font-display text-4xl font-bold text-white mb-1">{restaurant.name}</h1>
              <p className="text-night-300 text-sm">{restaurant.cuisine} • {restaurant.openingHours}</p>
            </div>
            <div className="flex items-center gap-1.5 bg-night-950/80 backdrop-blur-sm border border-night-800 px-3 py-1.5 rounded-full">
              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400"/>
              <span className="font-bold text-white">{restaurant.rating}</span>
              <span className="text-night-500 text-xs">({restaurant.reviewCount})</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { icon:Clock, label:`${restaurant.deliveryTime} min`, sub:'Delivery time', color:'text-blue-400', bg:'bg-blue-500/10 border-blue-500/20' },
          { icon:Bike, label:`₹${restaurant.deliveryFee}`, sub:'Delivery fee', color:'text-ember-400', bg:'bg-ember-500/10 border-ember-500/20' },
          { icon:MapPin, label:`₹${restaurant.minOrderAmount}`, sub:'Min order', color:'text-emerald-400', bg:'bg-emerald-500/10 border-emerald-500/20' },
        ].map(s => (
          <div key={s.label} className={`card border ${s.bg} p-4 flex items-center gap-3`}>
            <s.icon className={`w-5 h-5 ${s.color} flex-shrink-0`}/>
            <div>
              <p className="font-bold text-night-100 text-sm">{s.label}</p>
              <p className="text-night-500 text-xs">{s.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {restaurant.description && <p className="text-night-400 mb-6 text-sm leading-relaxed">{restaurant.description}</p>}

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-night-800/60 border border-night-700 rounded-2xl mb-6 w-fit">
        {['menu','reviews'].map(tab => (
          <button key={tab} onClick={()=>setActiveTab(tab)}
            className={`px-6 py-2 rounded-xl text-sm font-semibold capitalize transition-all ${activeTab===tab ? 'bg-ember-500 text-night-950 shadow-lg' : 'text-night-400 hover:text-night-200'}`}>
            {tab} {tab==='reviews' && `(${reviews.length})`}
          </button>
        ))}
      </div>

      {activeTab==='menu' && (
        <div>
          {/* Category pills */}
          <div className="flex gap-2 overflow-x-auto pb-2 mb-5 scrollbar-hide">
            {categories.map(cat => (
              <button key={cat} onClick={()=>setSelectedCat(cat)}
                className={`whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${selectedCat===cat ? 'bg-ember-500 text-night-950' : 'bg-night-800 text-night-400 border border-night-700 hover:border-ember-500/40'}`}>
                {cat}
              </button>
            ))}
          </div>
          {/* Items */}
          <div className="space-y-3">
            {filteredMenu.map(item => {
              const qty = getQty(item.id)
              return (
                <div key={item.id} className={`card-hover flex items-center gap-4 p-4 ${!item.available?'opacity-40':''}`}>
                  {item.imageUrl && (
                    <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
                      <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover"/>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {item.vegetarian && (
                        <div className="w-4 h-4 border-2 border-emerald-500 rounded-sm flex items-center justify-center flex-shrink-0">
                          <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"/>
                        </div>
                      )}
                      <h3 className="font-semibold text-night-100 truncate">{item.name}</h3>
                    </div>
                    <p className="text-night-500 text-xs line-clamp-1 mb-2">{item.description}</p>
                    <p className="text-ember-400 font-bold">₹{item.price}</p>
                  </div>
                  <div className="flex-shrink-0">
                    {!item.available ? (
                      <span className="badge-red">Unavailable</span>
                    ) : qty===0 ? (
                      <button onClick={()=>addToCart(item, restaurant.id, restaurant.name)}
                        className="btn-ember py-1.5 px-4 text-sm">Add +</button>
                    ) : (
                      <div className="flex items-center gap-2 bg-ember-500/10 border border-ember-500/30 rounded-xl p-1">
                        <button onClick={()=>removeFromCart(item.id)} className="w-7 h-7 bg-night-800 rounded-lg flex items-center justify-center hover:bg-night-700 transition-colors">
                          <Minus className="w-3 h-3 text-night-300"/>
                        </button>
                        <span className="w-6 text-center font-bold text-ember-400 text-sm">{qty}</span>
                        <button onClick={()=>addToCart(item, restaurant.id, restaurant.name)} className="w-7 h-7 bg-ember-500 rounded-lg flex items-center justify-center hover:bg-ember-600 transition-colors">
                          <Plus className="w-3 h-3 text-night-950"/>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {activeTab==='reviews' && (
        <div className="space-y-4">
          {user?.role==='CUSTOMER' && (
            <form onSubmit={handleReview} className="card p-5 border border-ember-500/20 mb-6">
              <h3 className="font-semibold text-night-100 mb-4">Share your experience</h3>
              <div className="flex gap-1 mb-3">
                {[1,2,3,4,5].map(n => (
                  <button key={n} type="button" onClick={()=>setReviewForm({...reviewForm,rating:n})}>
                    <Star className={`w-7 h-7 transition-colors ${n<=reviewForm.rating?'text-yellow-400 fill-yellow-400':'text-night-700'}`}/>
                  </button>
                ))}
              </div>
              <textarea className="input resize-none mb-3" rows={3} placeholder="What did you love? (optional)" value={reviewForm.comment} onChange={e=>setReviewForm({...reviewForm,comment:e.target.value})}/>
              <button type="submit" className="btn-ember">Post Review</button>
            </form>
          )}
          {reviews.map(rev => (
            <div key={rev.id} className="card p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-semibold text-night-100">{rev.customerName}</p>
                  <div className="flex gap-0.5 mt-1">
                    {[...Array(5)].map((_,i) => <Star key={i} className={`w-3.5 h-3.5 ${i<rev.rating?'text-yellow-400 fill-yellow-400':'text-night-700'}`}/>)}
                  </div>
                </div>
                <span className="text-xs text-night-600 font-mono">{new Date(rev.createdAt).toLocaleDateString()}</span>
              </div>
              {rev.comment && <p className="text-night-400 text-sm">{rev.comment}</p>}
            </div>
          ))}
          {reviews.length===0 && <div className="text-center py-10 text-night-500">No reviews yet. Be the first to review!</div>}
        </div>
      )}

      {/* Floating cart */}
      {itemCount>0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 animate-slide-up">
          <Link to="/cart" className="flex items-center gap-3 bg-ember-500 text-night-950 px-6 py-3.5 rounded-2xl shadow-2xl shadow-ember-500/40 hover:bg-ember-400 transition-all font-bold">
            <ShoppingCart className="w-5 h-5"/>
            <span>View Cart</span>
            <span className="bg-night-950/20 px-2.5 py-0.5 rounded-full text-sm font-bold">{itemCount} items</span>
          </Link>
        </div>
      )}
    </div>
  )
}
