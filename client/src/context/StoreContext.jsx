import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useAuth } from './AuthContext'
import { api } from '../lib/api'

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
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated])

  useEffect(() => {
    if (isAuthenticated) fetchAll()
    else {
      setClients([])
      setProspects([])
      setTasks([])
      setNotes([])
      setLoading(false)
    }
  }, [isAuthenticated, fetchAll])

  const addClient = async (client) => {
    const newClient = await api.createClient(client)
    setClients(prev => [newClient, ...prev])
    return newClient
  }

  const updateClient = async (id, updates) => {
    const updated = await api.updateClient(id, updates)
    setClients(prev => prev.map(c => c.id === id ? updated : c))
  }

  const deleteClient = async (id) => {
    await api.deleteClient(id)
    setClients(prev => prev.filter(c => c.id !== id))
  }

  const addProspect = async (prospect) => {
    const newProspect = await api.createProspect(prospect)
    setProspects(prev => [newProspect, ...prev])
    return newProspect
  }

  const updateProspect = async (id, updates) => {
    const updated = await api.updateProspect(id, updates)
    setProspects(prev => prev.map(p => p.id === id ? updated : p))
  }

  const deleteProspect = async (id) => {
    await api.deleteProspect(id)
    setProspects(prev => prev.filter(p => p.id !== id))
  }

  const convertProspectToClient = async (prospectId) => {
    const newClient = await api.convertProspect(prospectId)
    setProspects(prev => prev.filter(p => p.id !== prospectId))
    setClients(prev => [newClient, ...prev])
    return newClient
  }

  const addTask = async (task) => {
    const newTask = await api.createTask(task)
    setTasks(prev => [newTask, ...prev])
    return newTask
  }

  const updateTask = async (id, updates) => {
    const updated = await api.updateTask(id, updates)
    setTasks(prev => prev.map(t => t.id === id ? updated : t))
  }

  const deleteTask = async (id) => {
    await api.deleteTask(id)
    setTasks(prev => prev.filter(t => t.id !== id))
  }

  const toggleTaskComplete = async (id) => {
    const task = tasks.find(t => t.id === id)
    if (!task) return
    await updateTask(id, { ...task, completed: !task.completed })
  }

  const addNote = async (note) => {
    const newNote = await api.createNote(note)
    setNotes(prev => [newNote, ...prev])
    return newNote
  }

  const deleteNote = async (id) => {
    await api.deleteNote(id)
    setNotes(prev => prev.filter(n => n.id !== id))
  }

  const getNotesForEntity = (entityId, entityType) =>
    notes.filter(n => n.entityId === entityId && n.entityType === entityType)

  return (
    <StoreContext.Provider value={{
      clients, prospects, tasks, notes, loading, error, refetch: fetchAll,
      addClient, updateClient, deleteClient,
      addProspect, updateProspect, deleteProspect, convertProspectToClient,
      addTask, updateTask, deleteTask, toggleTaskComplete,
      addNote, deleteNote, getNotesForEntity,
    }}>
      {children}
    </StoreContext.Provider>
  )
}
