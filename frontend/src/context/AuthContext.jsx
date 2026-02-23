import React, { createContext, useContext, useState } from 'react'
import { authApi } from '../services/api'
const AuthContext = createContext(null)
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => { try { return JSON.parse(localStorage.getItem('user')); } catch { return null; } })
  const login = async (email, password) => {
    const { data } = await authApi.login({ email, password })
    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify(data))
    setUser(data); return data
  }
  const register = async (form) => {
    const { data } = await authApi.register(form)
    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify(data))
    setUser(data); return data
  }
  const logout = () => { localStorage.clear(); setUser(null) }
  return <AuthContext.Provider value={{ user, login, register, logout }}>{children}</AuthContext.Provider>
}
export const useAuth = () => { const ctx = useContext(AuthContext); if(!ctx) throw new Error('useAuth outside provider'); return ctx; }
