import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Heart, Star, Clock, ArrowRight, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'

// Favorites stored in localStorage with key "favorites"
function useFavorites() {
  const [favorites, setFavorites] = useState(() => {
    try { return JSON.parse(localStorage.getItem('favorites')) || [] } catch { return [] }
  })

  const remove = (id) => {
    const updated = favorites.filter(f => f.id !== id)
    setFavorites(updated)
    localStorage.setItem('favorites', JSON.stringify(updated))
    toast.success('Removed from favorites')
  }

  return { favorites, remove }
}

export default function FavoritesPage() {
  const { favorites, remove } = useFavorites()

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-red-500/15 border border-red-500/20 rounded-xl flex items-center justify-center">
          <Heart className="w-5 h-5 text-red-400 fill-red-400" />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>My Favorites</h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{favorites.length} saved restaurant{favorites.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {favorites.length === 0 ? (
        <div className="card p-16 text-center">
          <div className="w-20 h-20 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Heart className="w-10 h-10 text-red-300" />
          </div>
          <h2 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>No favorites yet</h2>
          <p className="mb-6" style={{ color: 'var(--text-muted)' }}>Save restaurants you love for quick access!</p>
          <Link to="/" className="btn-ember">Explore Restaurants</Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {favorites.map(restaurant => (
            <div key={restaurant.id} className="card-hover group relative">
              <div className="h-32 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-ember-500/20 to-transparent" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-5xl">🍽️</span>
                </div>
                <button
                  onClick={() => remove(restaurant.id)}
                  className="absolute top-3 right-3 w-8 h-8 bg-red-500/20 border border-red-500/30 rounded-full flex items-center justify-center hover:bg-red-500/40 transition-all opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="w-3.5 h-3.5 text-red-400" />
                </button>
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-bold" style={{ color: 'var(--text-primary)' }}>{restaurant.name}</h3>
                  {restaurant.rating && (
                    <span className="flex items-center gap-1 text-xs font-semibold text-amber-400">
                      <Star className="w-3 h-3 fill-amber-400" />{restaurant.rating}
                    </span>
                  )}
                </div>
                {restaurant.cuisine && (
                  <p className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>{restaurant.cuisine}</p>
                )}
                <Link to={`/restaurant/${restaurant.id}`} className="btn-ember w-full py-2 text-sm">
                  Order Now <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
