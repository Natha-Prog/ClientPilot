const BASE = import.meta.env.VITE_API_URL || '/api'

async function request(path, options = {}) {
  let res
  try {
    res = await fetch(`${BASE}${path}`, {
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', ...options.headers },
      ...options,
    })
  } catch {
    throw new Error('Impossible de contacter le serveur. Vérifiez votre connexion.')
  }

  // A misconfigured deploy (e.g. SPA fallback catching /api) returns HTML with a
  // 200 status. Treat any non-JSON response as an error instead of silently
  // returning an empty object — otherwise the app would fake a logged-in state.
  const contentType = res.headers.get('content-type') || ''
  const isJson = contentType.includes('application/json')
  const data = isJson ? await res.json().catch(() => null) : null

  if (!res.ok || !isJson) {
    const message = (data && data.error) || `Erreur serveur (${res.status})`
    throw new Error(message)
  }

  return data
}

export const api = {
  login: (email, password) =>
    request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),

  register: (email, password, name, role) =>
    request('/auth/register', { method: 'POST', body: JSON.stringify({ email, password, name, role }) }),

  logout: () => request('/auth/logout', { method: 'POST' }),

  me: () => request('/auth/me'),

  getClients: () => request('/clients'),
  createClient: (data) => request('/clients', { method: 'POST', body: JSON.stringify(data) }),
  updateClient: (id, data) => request(`/clients/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteClient: (id) => request(`/clients/${id}`, { method: 'DELETE' }),

  getProspects: () => request('/prospects'),
  createProspect: (data) => request('/prospects', { method: 'POST', body: JSON.stringify(data) }),
  updateProspect: (id, data) => request(`/prospects/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteProspect: (id) => request(`/prospects/${id}`, { method: 'DELETE' }),
  convertProspect: (id) => request(`/prospects/${id}/convert`, { method: 'POST' }),

  getTasks: () => request('/tasks'),
  createTask: (data) => request('/tasks', { method: 'POST', body: JSON.stringify(data) }),
  updateTask: (id, data) => request(`/tasks/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteTask: (id) => request(`/tasks/${id}`, { method: 'DELETE' }),

  getNotes: () => request('/notes'),
  createNote: (data) => request('/notes', { method: 'POST', body: JSON.stringify(data) }),
  deleteNote: (id) => request(`/notes/${id}`, { method: 'DELETE' }),

  getUsers: () => request('/users'),
  createUser: (data) => request('/users', { method: 'POST', body: JSON.stringify(data) }),
  updateUser: (id, data) => request(`/users/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteUser: (id) => request(`/users/${id}`, { method: 'DELETE' }),

  getDashboardStats: () => request('/dashboard/stats'),
}
