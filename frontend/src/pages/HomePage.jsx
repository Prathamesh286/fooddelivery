import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Search, Star, Clock, Bike, Flame, TrendingUp, ChevronRight, Filter } from 'lucide-react'
import { restaurantApi } from '../services/api'
import toast from 'react-hot-toast'

const CUISINES = ['All','Indian','Italian','Chinese','American','Japanese','Thai','Mexican']
const CUISINE_EMOJI = { All:'🌍', Indian:'🍛', Italian:'🍕', Chinese:'🥡', American:'🍔', Japanese:'🍣', Thai:'🌶️', Mexican:'🌮' }

export default function HomePage() {
  const [restaurants, setRestaurants] = useState([])
  const [filtered, setFiltered] = useState([])
  const [search, setSearch] = useState('')
  const [cuisine, setCuisine] = useState('All')
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState('rating')

  useEffect(() => { restaurantApi.getAll().then(r=>{ setRestaurants(r.data); setFiltered(r.data) }).catch(()=>toast.error('Failed to load')).finally(()=>setLoading(false)) }, [])

  useEffect(() => {
    let r = [...restaurants]
    if (cuisine!=='All') r = r.filter(x=>x.cuisine===cuisine)
    if (search) r = r.filter(x=>x.name.toLowerCase().includes(search.toLowerCase())||x.cuisine?.toLowerCase().includes(search.toLowerCase()))
    if (sortBy==='rating') r.sort((a,b)=>b.rating-a.rating)
    else if (sortBy==='time') r.sort((a,b)=>a.deliveryTime-b.deliveryTime)
    else if (sortBy==='fee') r.sort((a,b)=>a.deliveryFee-b.deliveryFee)
    setFiltered(r)
  }, [search, cuisine, restaurants, sortBy])

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl mb-10 p-8 md:p-12">
        <div className="absolute inset-0 bg-gradient-to-br from-ember-900/80 via-night-900 to-night-950" />
        <div className="absolute inset-0 bg-ember-glow opacity-60" />
        <div className="absolute top-0 right-0 w-64 h-64 text-9xl opacity-10 flex items-center justify-center select-none pointer-events-none">🍽️</div>
        <div className="absolute bottom-0 right-24 w-32 h-32 text-7xl opacity-8 flex items-center justify-center select-none pointer-events-none">🔥</div>
        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center gap-2 mb-4">
            <span className="badge-ember"><Flame className="w-3 h-3"/>Hot & Fresh</span>
            <span className="badge bg-night-800/60 text-night-300 border border-night-700">{filtered.length} restaurants</span>
          </div>
          <h1 className="font-display text-5xl md:text-6xl font-bold mb-3">
            <span className="text-night-50">What are you</span><br/>
            <span className="text-ember-gradient text-glow">craving today?</span>
          </h1>
          <p className="text-night-400 text-lg mb-8">Fresh food from the best restaurants, delivered hot to your door</p>
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-night-500" />
            <input type="text" className="w-full bg-night-900/80 border border-night-700 text-night-100 placeholder-night-500 pl-12 pr-4 py-4 rounded-2xl text-sm focus:outline-none focus:border-ember-500/60 focus:ring-2 focus:ring-ember-500/20 transition-all backdrop-blur-sm text-base"
              placeholder="Search restaurants, cuisines..." value={search} onChange={e=>setSearch(e.target.value)} />
          </div>
        </div>
      </div>

      {/* Cuisine pills */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
        {CUISINES.map(c => (
          <button key={c} onClick={()=>setCuisine(c)}
            className={`whitespace-nowrap flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${cuisine===c ? 'bg-ember-500 text-night-950 shadow-lg shadow-ember-500/30' : 'bg-night-800 text-night-300 border border-night-700 hover:border-ember-500/40 hover:text-ember-400'}`}>
            <span>{CUISINE_EMOJI[c]}</span>{c}
          </button>
        ))}
      </div>

      {/* Sort + count */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-night-400 text-sm"><span className="text-night-100 font-semibold">{filtered.length}</span> restaurants found</p>
        <div className="flex items-center gap-2">
          <span className="text-night-500 text-xs">Sort:</span>
          {[{v:'rating',l:'Top Rated'},{v:'time',l:'Fastest'},{v:'fee',l:'Lowest Fee'}].map(s=>(
            <button key={s.v} onClick={()=>setSortBy(s.v)}
              className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${sortBy===s.v ? 'bg-ember-500/15 text-ember-400 border border-ember-500/20' : 'text-night-500 hover:text-night-300'}`}>
              {s.l}
            </button>
          ))}
        </div>
      </div>

      {/* Restaurant grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {[...Array(8)].map((_,i) => (
            <div key={i} className="card">
              <div className="h-48 skeleton"/>
              <div className="p-4 space-y-2"><div className="h-4 skeleton w-3/4"/><div className="h-3 skeleton w-1/2"/></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filtered.map((r, i) => (
            <Link key={r.id} to={`/restaurant/${r.id}`}
              className="card-hover group animate-fade-in"
              style={{ animationDelay: `${i*50}ms` }}>
              {/* Image */}
              <div className="relative h-48 overflow-hidden">
                <img src={r.imageUrl||'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800'} alt={r.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"/>
                <div className="absolute inset-0 bg-gradient-to-t from-night-950/80 via-transparent to-transparent"/>
                {!r.open && <div className="absolute inset-0 bg-night-950/70 flex items-center justify-center"><span className="bg-night-900 border border-night-700 text-night-300 text-xs font-semibold px-3 py-1 rounded-full">Closed</span></div>}
                {/* Rating badge */}
                <div className="absolute top-3 right-3 flex items-center gap-1 bg-night-950/80 backdrop-blur-sm border border-night-800 px-2 py-1 rounded-full">
                  <Star className="w-3 h-3 text-yellow-400 fill-yellow-400"/>
                  <span className="text-xs font-bold text-night-100">{r.rating||'4.0'}</span>
                </div>
                {/* Cuisine tag */}
                <div className="absolute bottom-3 left-3">
                  <span className="badge bg-night-950/80 backdrop-blur-sm border-night-800 text-night-300">{r.cuisine}</span>
                </div>
              </div>
              {/* Info */}
              <div className="p-4">
                <h3 className="font-bold text-night-50 text-base mb-1 group-hover:text-ember-400 transition-colors">{r.name}</h3>
                <p className="text-night-500 text-xs line-clamp-1 mb-3">{r.description}</p>
                <div className="flex items-center justify-between text-night-500 text-xs border-t border-night-800/60 pt-3">
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-night-600"/>{r.deliveryTime}min</span>
                  <span className="flex items-center gap-1"><Bike className="w-3.5 h-3.5 text-night-600"/>₹{r.deliveryFee}</span>
                  <span className="text-night-600">Min ₹{r.minOrderAmount}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="text-center py-20 animate-fade-in">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-bold text-night-300 mb-2">No restaurants found</h3>
          <p className="text-night-600">Try a different search or cuisine</p>
        </div>
      )}
    </div>
  )
}
