import { Link, useLocation } from 'react-router-dom'
import { ChevronRight, Home } from 'lucide-react'

const routeLabels = {
  dashboard: 'Tableau de bord',
  clients: 'Clients',
  prospects: 'Prospects',
  tasks: 'Tâches',
  notes: 'Notes',
  users: 'Utilisateurs',
}

const Breadcrumbs = () => {
  const location = useLocation()
  const segment = location.pathname.replace(/^\//, '').split('/')[0] || 'dashboard'
  const label = routeLabels[segment] || segment

  if (segment === 'dashboard') {
    return (
      <nav className="flex items-center gap-1 text-sm text-muted-foreground">
        <Home className="h-4 w-4" />
        <span className="font-semibold text-brand-navy">{label}</span>
      </nav>
    )
  }

  return (
    <nav className="flex items-center gap-1 text-sm text-muted-foreground">
      <Link to="/dashboard" className="hover:text-brand-orange flex items-center gap-1 transition-colors">
        <Home className="h-4 w-4" />
      </Link>
      <ChevronRight className="h-4 w-4" />
      <span className="font-medium text-foreground">{label}</span>
    </nav>
  )
}

export default Breadcrumbs
