import { useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { StoreProvider } from './context/StoreContext'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ConfirmProvider } from './components/ConfirmDialog'
import { Menu, LogOut, User as UserIcon, Shield } from 'lucide-react'
import { Button } from './components/ui/button'
import { Skeleton } from './components/ui/skeleton'
import Sidebar from './components/Sidebar'
import Breadcrumbs from './components/Breadcrumbs'
import GlobalSearch from './components/GlobalSearch'
import Dashboard from './components/Dashboard'
import Clients from './components/Clients'
import Prospects from './components/Prospects'
import Tasks from './components/Tasks'
import Notes from './components/Notes'
import Login from './components/Login'
import UserManagement from './components/UserManagement'
import NotFound from './components/NotFound'

const AdminRoute = ({ children }) => {
  const { isAdmin } = useAuth()
  if (!isAdmin()) return <Navigate to="/dashboard" replace />
  return children
}

const AppLayout = () => {
  const { user, logout, isAdmin } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col lg:ml-0 min-w-0">
        <header className="border-b bg-card px-4 lg:px-6 py-3 flex items-center gap-3 sticky top-0 z-30 shadow-header">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden shrink-0"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="hidden sm:block shrink-0">
            <Breadcrumbs />
          </div>
          <GlobalSearch />
          <div className="flex items-center gap-2 shrink-0 ml-auto">
            <div className="hidden md:flex items-center gap-2 text-sm">
              <UserIcon className="h-4 w-4" />
              <span>{user?.name}</span>
              {isAdmin() && <Shield className="h-4 w-4 text-brand-orange" />}
            </div>
            <Button variant="ghost" size="icon" onClick={logout} title="Déconnexion">
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </header>
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/clients" element={<Clients />} />
            <Route path="/prospects" element={<Prospects />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/notes" element={<Notes />} />
            <Route path="/users" element={<AdminRoute><UserManagement /></AdminRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}

const AppContent = () => {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-md space-y-4">
          <Skeleton className="h-12 w-48 mx-auto" />
          <Skeleton className="h-4 w-64 mx-auto" />
          <div className="grid grid-cols-2 gap-4 mt-8">
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
          </div>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) return <Login />

  return <AppLayout />
}

const App = () => (
  <AuthProvider>
    <StoreProvider>
      <ConfirmProvider>
        <AppContent />
      </ConfirmProvider>
    </StoreProvider>
  </AuthProvider>
)

export default App
