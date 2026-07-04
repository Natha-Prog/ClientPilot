import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useAuth } from './AuthContext'
import { api } from '../lib/api'
import { storage, STORAGE_KEYS_CONST } from '../lib/storage'

const StoreContext = createContext(null)

export const useStore = () => {
  const context = useContext(StoreContext)
  if (!context) throw new Error('useStore must be used within a StoreProvider')
  return context
}

export const StoreProvider = ({ children }) => {
  const { isAuthenticated } = useAuth()
  const [clients, setClients] = useState([])
  const [prospects, setProspects] = useState([])
  const [tasks, setTasks] = useState([])
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isOnline, setIsOnline] = useState(navigator.onLine)

  const fetchAll = useCallback(async () => {
    if (!isAuthenticated) return
    setLoading(true)
    setError(null)
    try {
      const [c, p, t, n] = await Promise.all([
        api.getClients(),
        api.getProspects(),
        api.getTasks(),
        api.getNotes(),
      ])
      setClients(c)
      setProspects(p)
      setTasks(t)
      setNotes(n)
      storage.set(STORAGE_KEYS_CONST.CLIENTS, c)
      storage.set(STORAGE_KEYS_CONST.PROSPECTS, p)
      storage.set(STORAGE_KEYS_CONST.TASKS, t)
      storage.set(STORAGE_KEYS_CONST.NOTES, n)
      storage.set(STORAGE_KEYS_CONST.LAST_SYNC, new Date().toISOString())
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated])

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      if (isAuthenticated) fetchAll()
    }
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [isAuthenticated, fetchAll])

  useEffect(() => {
    if (isAuthenticated) {
      const savedClients = storage.get(STORAGE_KEYS_CONST.CLIENTS)
      const savedProspects = storage.get(STORAGE_KEYS_CONST.PROSPECTS)
      const savedTasks = storage.get(STORAGE_KEYS_CONST.TASKS)
      const savedNotes = storage.get(STORAGE_KEYS_CONST.NOTES)
      
      if (savedClients) setClients(savedClients)
      if (savedProspects) setProspects(savedProspects)
      if (savedTasks) setTasks(savedTasks)
      if (savedNotes) setNotes(savedNotes)
      
      if (isOnline) fetchAll()
    } else {
      setClients([])
      setProspects([])
      setTasks([])
      setNotes([])
      storage.clear()
      setLoading(false)
    }
  }, [isAuthenticated, fetchAll, isOnline])

  const addClient = async (client) => {
    const newClient = await api.createClient(client)
    setClients(prev => {
      const updated = [newClient, ...prev]
      storage.set(STORAGE_KEYS_CONST.CLIENTS, updated)
      return updated
    })
    return newClient
  }

  const updateClient = async (id, updates) => {
    const updated = await api.updateClient(id, updates)
    setClients(prev => {
      const newClients = prev.map(c => c.id === id ? updated : c)
      storage.set(STORAGE_KEYS_CONST.CLIENTS, newClients)
      return newClients
    })
  }

  const deleteClient = async (id) => {
    await api.deleteClient(id)
    setClients(prev => {
      const newClients = prev.filter(c => c.id !== id)
      storage.set(STORAGE_KEYS_CONST.CLIENTS, newClients)
      return newClients
    })
  }

  const addProspect = async (prospect) => {
    const newProspect = await api.createProspect(prospect)
    setProspects(prev => {
      const updated = [newProspect, ...prev]
      storage.set(STORAGE_KEYS_CONST.PROSPECTS, updated)
      return updated
    })
    return newProspect
  }

  const updateProspect = async (id, updates) => {
    const updated = await api.updateProspect(id, updates)
    setProspects(prev => {
      const newProspects = prev.map(p => p.id === id ? updated : p)
      storage.set(STORAGE_KEYS_CONST.PROSPECTS, newProspects)
      return newProspects
    })
  }

  const deleteProspect = async (id) => {
    await api.deleteProspect(id)
    setProspects(prev => {
      const newProspects = prev.filter(p => p.id !== id)
      storage.set(STORAGE_KEYS_CONST.PROSPECTS, newProspects)
      return newProspects
    })
  }

  const convertProspectToClient = async (prospectId) => {
    const newClient = await api.convertProspect(prospectId)
    setProspects(prev => {
      const newProspects = prev.filter(p => p.id !== prospectId)
      storage.set(STORAGE_KEYS_CONST.PROSPECTS, newProspects)
      return newProspects
    })
    setClients(prev => {
      const newClients = [newClient, ...prev]
      storage.set(STORAGE_KEYS_CONST.CLIENTS, newClients)
      return newClients
    })
    return newClient
  }

  const addTask = async (task) => {
    const newTask = await api.createTask(task)
    setTasks(prev => {
      const updated = [newTask, ...prev]
      storage.set(STORAGE_KEYS_CONST.TASKS, updated)
      return updated
    })
    return newTask
  }

  const updateTask = async (id, updates) => {
    const updated = await api.updateTask(id, updates)
    setTasks(prev => {
      const newTasks = prev.map(t => t.id === id ? updated : t)
      storage.set(STORAGE_KEYS_CONST.TASKS, newTasks)
      return newTasks
    })
  }

  const deleteTask = async (id) => {
    await api.deleteTask(id)
    setTasks(prev => {
      const newTasks = prev.filter(t => t.id !== id)
      storage.set(STORAGE_KEYS_CONST.TASKS, newTasks)
      return newTasks
    })
  }

  const toggleTaskComplete = async (id) => {
    const task = tasks.find(t => t.id === id)
    if (!task) return
    await updateTask(id, { ...task, completed: !task.completed })
  }

  const addNote = async (note) => {
    const newNote = await api.createNote(note)
    setNotes(prev => {
      const updated = [newNote, ...prev]
      storage.set(STORAGE_KEYS_CONST.NOTES, updated)
      return updated
    })
    return newNote
  }

  const deleteNote = async (id) => {
    await api.deleteNote(id)
    setNotes(prev => {
      const newNotes = prev.filter(n => n.id !== id)
      storage.set(STORAGE_KEYS_CONST.NOTES, newNotes)
      return newNotes
    })
  }

  const getNotesForEntity = (entityId, entityType) =>
    notes.filter(n => n.entityId === entityId && n.entityType === entityType)

  return (
    <StoreContext.Provider value={{
      clients, prospects, tasks, notes, loading, error, refetch: fetchAll, isOnline,
      addClient, updateClient, deleteClient,
      addProspect, updateProspect, deleteProspect, convertProspectToClient,
      addTask, updateTask, deleteTask, toggleTaskComplete,
      addNote, deleteNote, getNotesForEntity,
    }}>
      {children}
    </StoreContext.Provider>
  )
}
