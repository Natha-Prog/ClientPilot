const STORAGE_KEYS = {
  AUTH: 'clientpilot_auth',
  CLIENTS: 'clientpilot_clients',
  PROSPECTS: 'clientpilot_prospects',
  TASKS: 'clientpilot_tasks',
  NOTES: 'clientpilot_notes',
  LAST_SYNC: 'clientpilot_last_sync',
}

export const storage = {
  get: (key) => {
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : null
    } catch (error) {
      console.error(`Error reading ${key} from localStorage:`, error)
      return null
    }
  },

  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.error(`Error saving ${key} to localStorage:`, error)
    }
  },

  remove: (key) => {
    try {
      localStorage.removeItem(key)
    } catch (error) {
      console.error(`Error removing ${key} from localStorage:`, error)
    }
  },

  clear: () => {
    try {
      Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key))
    } catch (error) {
      console.error('Error clearing localStorage:', error)
    }
  },
}

export const STORAGE_KEYS_CONST = STORAGE_KEYS
