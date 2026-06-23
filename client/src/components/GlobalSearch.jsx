import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../context/StoreContext'
import { Input } from './ui/input'
import { Search, Users, UserPlus, Calendar } from 'lucide-react'

const GlobalSearch = () => {
  const { clients, prospects, tasks } = useStore()
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const ref = useRef(null)

  const q = query.toLowerCase().trim()

  const results = q.length < 2 ? [] : [
    ...clients.filter(c => c.name?.toLowerCase().includes(q) || c.email?.toLowerCase().includes(q) || c.company?.toLowerCase().includes(q))
      .map(c => ({ type: 'client', id: c.id, label: c.name, sub: c.company || c.email, path: '/clients' })),
    ...prospects.filter(p => p.name?.toLowerCase().includes(q) || p.email?.toLowerCase().includes(q))
      .map(p => ({ type: 'prospect', id: p.id, label: p.name, sub: p.company || p.email, path: '/prospects' })),
    ...tasks.filter(t => t.title?.toLowerCase().includes(q))
      .map(t => ({ type: 'task', id: t.id, label: t.title, sub: t.description, path: '/tasks' })),
  ].slice(0, 8)

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const icons = { client: Users, prospect: UserPlus, task: Calendar }

  const handleSelect = (result) => {
    navigate(result.path)
    setQuery('')
    setOpen(false)
  }

  return (
    <div ref={ref} className="relative flex-1 max-w-md">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder="Rechercher clients, prospects, tâches..."
        className="pl-9"
        value={query}
        onChange={(e) => { setQuery(e.target.value); setOpen(true) }}
        onFocus={() => setOpen(true)}
      />
      {open && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-card border rounded-lg shadow-lg z-50 overflow-hidden">
          {results.map((r) => {
            const Icon = icons[r.type]
            return (
              <button
                key={`${r.type}-${r.id}`}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-accent text-left"
                onClick={() => handleSelect(r)}
              >
                <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
                <div className="min-w-0">
                  <div className="font-medium truncate">{r.label}</div>
                  {r.sub && <div className="text-xs text-muted-foreground truncate">{r.sub}</div>}
                </div>
              </button>
            )
          })}
        </div>
      )}
      {open && q.length >= 2 && results.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-card border rounded-lg shadow-lg z-50 p-4 text-sm text-muted-foreground text-center">
          Aucun résultat
        </div>
      )}
    </div>
  )
}

export default GlobalSearch
