import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { LayoutDashboard, Users, UserPlus, Calendar, FileText, X, Shield } from 'lucide-react'
import { cn } from '../lib/utils'

const Sidebar = ({ isOpen, onClose }) => {
  const { isAdmin } = useAuth()

  const menuItems = [
    { path: '/dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
    { path: '/clients', label: 'Clients', icon: Users },
    { path: '/prospects', label: 'Prospects', icon: UserPlus },
    { path: '/tasks', label: 'Tâches', icon: Calendar },
    { path: '/notes', label: 'Notes', icon: FileText },
  ]

  if (isAdmin()) {
    menuItems.push({ path: '/users', label: 'Utilisateurs', icon: Shield })
  }

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={onClose} />
      )}
      <aside
        className={cn(
          'fixed left-0 top-0 z-50 h-full w-64 bg-sidebar border-r border-sidebar-border shadow-sm transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:z-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between px-5 py-5 border-b border-sidebar-border">
            <div className="flex items-center gap-3 min-w-0">
              <img src="/logo.png" alt="ClientPilot" className="h-10 w-auto object-contain shrink-0" />
              <div className="min-w-0 leading-tight">
                <h1 className="text-base font-bold text-brand-navy truncate">ClientPilot</h1>
                <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-sidebar-muted">CRM Pro</p>
              </div>
            </div>
            <button onClick={onClose} className="lg:hidden text-sidebar-muted hover:text-brand-navy" aria-label="Fermer le menu">
              <X className="h-5 w-5" />
            </button>
          </div>
          <nav className="flex-1 p-3 space-y-0.5">
            {menuItems.map((item) => {
              const Icon = item.icon
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={({ isActive }) =>
                    cn('nav-link', isActive && 'nav-link-active')
                  }
                >
                  <Icon className={cn('h-4 w-4 shrink-0')} />
                  {item.label}
                </NavLink>
              )
            })}
          </nav>
          <div className="p-4 border-t border-sidebar-border">
            <p className="text-[10px] text-sidebar-muted text-center uppercase tracking-wider">v1.0.0</p>
          </div>
        </div>
      </aside>
    </>
  )
}

export default Sidebar
