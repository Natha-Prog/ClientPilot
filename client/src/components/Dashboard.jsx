import { useState, useEffect } from 'react'
import { useStore } from '../context/StoreContext'
import { Card, CardHeader, CardTitle, CardContent } from './ui/card'
import { Button } from './ui/button'
import { Skeleton } from './ui/skeleton'
import { Users, UserPlus, Calendar, TrendingUp, Download } from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { toast } from 'sonner'
import { exportToCSV } from '../lib/export'
import { api } from '../lib/api'

const statusLabels = { new: 'Nouveau', contacted: 'Contacté', qualified: 'Qualifié', lost: 'Perdu' }
const statusColors = { new: 'bg-sky-500', contacted: 'bg-amber-500', qualified: 'bg-emerald-500', lost: 'bg-red-400' }

const Dashboard = () => {
  const { clients, prospects, tasks, loading, error, refetch } = useStore()
  const [stats, setStats] = useState(null)

  useEffect(() => {
    if (!loading) {
      api.getDashboardStats().then(setStats).catch(() => setStats(null))
    }
  }, [loading, clients.length, prospects.length, tasks.length])

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28" />)}
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <Skeleton className="h-48 md:col-span-1" />
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
        </div>
      </div>
    )
  }

  const completedTasks = stats?.completedTasks ?? tasks.filter(t => t.completed).length
  const pendingTasks = stats?.pendingTasks ?? tasks.filter(t => !t.completed).length
  const clientCount = stats?.clients ?? clients.length
  const prospectCount = stats?.prospects ?? prospects.length
  const conversionRate = stats?.conversionRate ?? (prospectCount > 0
    ? ((clientCount / (clientCount + prospectCount)) * 100).toFixed(1)
    : 0)

  const recentActivities = [
    ...clients.map(c => ({ type: 'client', name: c.name, date: c.createdAt, action: 'Client ajouté' })),
    ...prospects.map(p => ({ type: 'prospect', name: p.name, date: p.createdAt, action: 'Prospect ajouté' })),
    ...tasks.map(t => ({ type: 'task', name: t.title, date: t.createdAt, action: 'Tâche créée' })),
  ]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5)

  const upcomingTasks = tasks
    .filter(t => !t.completed && t.dueDate)
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    .slice(0, 5)

  const prospectByStatus = stats?.prospectByStatus
    ? ['new', 'contacted', 'qualified', 'lost'].map(status => ({
        status,
        count: stats.prospectByStatus.find(s => s.status === status)?.count || 0,
      }))
    : ['new', 'contacted', 'qualified', 'lost'].map(status => ({
        status,
        count: prospects.filter(p => p.status === status).length,
      }))

  const maxCount = Math.max(...prospectByStatus.map(s => s.count), 1)

  const handleExportClients = () => {
    exportToCSV(clients, 'clients.csv', [
      { key: 'name', label: 'Nom' },
      { key: 'company', label: 'Entreprise' },
      { key: 'email', label: 'Email' },
      { key: 'phone', label: 'Téléphone' },
      { key: 'status', label: 'Statut' },
    ])
    toast.success('Export clients téléchargé')
  }

  const handleExportProspects = () => {
    exportToCSV(prospects, 'prospects.csv', [
      { key: 'name', label: 'Nom' },
      { key: 'company', label: 'Entreprise' },
      { key: 'email', label: 'Email' },
      { key: 'status', label: 'Statut' },
      { key: 'source', label: 'Source' },
    ])
    toast.success('Export prospects téléchargé')
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-lg flex items-center justify-between text-sm">
          <span>{error}</span>
          <Button variant="outline" size="sm" onClick={refetch}>Réessayer</Button>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-title">Tableau de bord</h1>
          <p className="page-subtitle">Vue d&apos;ensemble de votre CRM</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleExportClients}>
            <Download className="h-4 w-4 mr-2" />
            Clients CSV
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportProspects}>
            <Download className="h-4 w-4 mr-2" />
            Prospects CSV
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-brand-navy">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Clients</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-brand-navy/10 flex items-center justify-center">
              <Users className="h-4 w-4 text-brand-navy" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-brand-navy">{clientCount}</div>
            <p className="text-xs text-muted-foreground">Total clients</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-brand-orange">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Prospects</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-brand-orange/10 flex items-center justify-center">
              <UserPlus className="h-4 w-4 text-brand-orange" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-brand-navy">{prospectCount}</div>
            <p className="text-xs text-muted-foreground">En cours de conversion</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-sky-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Tâches</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-sky-50 flex items-center justify-center">
              <Calendar className="h-4 w-4 text-sky-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-brand-navy">{pendingTasks}</div>
            <p className="text-xs text-muted-foreground">{completedTasks} complétées</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-emerald-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Taux de conversion</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-emerald-50 flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-emerald-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-brand-navy">{conversionRate}%</div>
            <p className="text-xs text-muted-foreground">Prospects → Clients</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="md:col-span-1">
          <CardHeader><CardTitle>Pipeline prospects</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {prospectByStatus.map(({ status, count }) => (
              <div key={status} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>{statusLabels[status]}</span>
                  <span className="font-medium">{count}</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${statusColors[status]} transition-all`} style={{ width: `${(count / maxCount) * 100}%` }} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Tâches à venir</CardTitle></CardHeader>
          <CardContent>
            {upcomingTasks.length === 0 ? (
              <p className="text-sm text-muted-foreground">Aucune tâche à venir</p>
            ) : (
              <div className="space-y-3">
                {upcomingTasks.map((task) => (
                  <div key={task.id} className="flex items-center justify-between text-sm">
                    <span className="font-medium truncate mr-2">{task.title}</span>
                    <span className="text-muted-foreground shrink-0">
                      {format(new Date(task.dueDate), 'dd MMM yyyy', { locale: fr })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Activités récentes</CardTitle></CardHeader>
          <CardContent>
            {recentActivities.length === 0 ? (
              <p className="text-sm text-muted-foreground">Aucune activité récente</p>
            ) : (
              <div className="space-y-3">
                {recentActivities.map((activity, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <div className="min-w-0">
                      <span className="font-medium">{activity.name}</span>
                      <span className="text-muted-foreground ml-2">{activity.action}</span>
                    </div>
                    <span className="text-muted-foreground shrink-0 ml-2">
                      {format(new Date(activity.date), 'dd MMM', { locale: fr })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Dashboard
