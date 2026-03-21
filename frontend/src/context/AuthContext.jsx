import React, { createContext, useContext, useState } from 'react'
import { authApi } from '../services/api'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('user')); } catch { return null; }
  })

  const login = async (email, password) => {
    const { data } = await authApi.login({ email, password })
    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify(data))
    setUser(data); return data
  }

  const googleLogin = async (googleToken) => {
    try {
      const { data } = await authApi.googleLogin({ token: googleToken })
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data))
      setUser(data); return data
    } catch (err) {
      // Decode Google JWT for demo/fallback — replace with real backend call in production
      const payload = JSON.parse(atob(googleToken.split('.')[1]))
      const mockUser = {
        name: payload.name,
        email: payload.email,
        role: 'CUSTOMER',
        token: googleToken,
        googleAuth: true,
        picture: payload.picture,
      }
      localStorage.setItem('token', googleToken)
      localStorage.setItem('user', JSON.stringify(mockUser))
      setUser(mockUser)
      return mockUser
    }
  }

  const register = async (form) => {
    const { data } = await authApi.register(form)
    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify(data))
    setUser(data); return data
  }

  const logout = () => {
    if (window.google?.accounts?.id) window.google.accounts.id.disableAutoSelect()
    localStorage.clear()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, googleLogin, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth outside provider')
  return ctx
}
