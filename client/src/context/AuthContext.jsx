import React, { createContext, useContext, useState, useEffect } from 'react'
import { api, setAuthToken } from '../lib/api'
import { storage, STORAGE_KEYS_CONST } from '../lib/storage'

const AuthContext = createContext(null)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}

function userFromAuthPayload(payload) {
  if (!payload) return null
  const { token: _token, ...user } = payload
  return user
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const savedAuth = storage.get(STORAGE_KEYS_CONST.AUTH)
    if (savedAuth?.token) setAuthToken(savedAuth.token)
    if (savedAuth?.user) {
      setUser(savedAuth.user)
      setIsAuthenticated(savedAuth.isAuthenticated)
      setLoading(false)
    }

    api.me()
      .then((userData) => {
        if (!userData?.id) throw new Error('Session invalide')
        setUser(userData)
        setIsAuthenticated(true)
        const token = savedAuth?.token || null
        storage.set(STORAGE_KEYS_CONST.AUTH, {
          user: userData,
          isAuthenticated: true,
          ...(token ? { token } : {}),
        })
      })
      .catch(() => {
        setUser(null)
        setIsAuthenticated(false)
        setAuthToken(null)
        storage.remove(STORAGE_KEYS_CONST.AUTH)
      })
      .finally(() => setLoading(false))
  }, [])

  const login = async (email, password) => {
    try {
      const payload = await api.login(email, password)
      const userData = userFromAuthPayload(payload)
      if (payload.token) setAuthToken(payload.token)
      setUser(userData)
      setIsAuthenticated(true)
      storage.set(STORAGE_KEYS_CONST.AUTH, {
        user: userData,
        isAuthenticated: true,
        token: payload.token,
      })
      return { success: true }
    } catch (err) {
      return { success: false, error: err.message }
    }
  }

  const register = async (email, password, name, role = 'operator') => {
    try {
      const payload = await api.register(email, password, name, role)
      const userData = userFromAuthPayload(payload)
      if (payload.token) setAuthToken(payload.token)
      setUser(userData)
      setIsAuthenticated(true)
      storage.set(STORAGE_KEYS_CONST.AUTH, {
        user: userData,
        isAuthenticated: true,
        token: payload.token,
      })
      return { success: true }
    } catch (err) {
      return { success: false, error: err.message }
    }
  }

  const logout = async () => {
    try {
      await api.logout()
    } catch {
      // ignore
    }
    setUser(null)
    setIsAuthenticated(false)
    setAuthToken(null)
    storage.remove(STORAGE_KEYS_CONST.AUTH)
  }

  const isAdmin = () => user?.role === 'admin'
  const isOperator = () => user?.role === 'operator'

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, loading, login, logout, register, isAdmin, isOperator }}>
      {children}
    </AuthContext.Provider>
  )
}
