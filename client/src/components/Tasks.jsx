import { useState } from 'react'
import { useStore } from '../context/StoreContext'
import { useConfirm } from './ConfirmDialog'
import { Card, CardContent } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Skeleton } from './ui/skeleton'
import { Dialog, DialogHeader, DialogTitle, DialogContent, DialogFooter, DialogClose } from './ui/dialog'
import { Textarea } from './ui/textarea'
import { Select } from './ui/select'
import { Plus, Pencil, Trash2, Calendar, CheckCircle2, Circle } from 'lucide-react'
import { format, isPast, isToday, isTomorrow } from 'date-fns'
import { fr } from 'date-fns/locale'
import { toast } from 'sonner'

const Tasks = () => {
  const { tasks, loading, addTask, updateTask, deleteTask, toggleTaskComplete } = useStore()
  const confirm = useConfirm()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [filter, setFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [formData, setFormData] = useState({ title: '', description: '', dueDate: '', priority: 'medium', relatedTo: '', relatedType: 'client' })

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.title.trim()) { toast.error('Le titre est requis'); return }
    try {
      if (editingTask) {
        await updateTask(editingTask.id, formData)
        toast.success('Tâche modifiée')
      } else {
        await addTask(formData)
        toast.success('Tâche ajoutée')
      }
      setIsDialogOpen(false)
      setEditingTask(null)
      setFormData({ title: '', description: '', dueDate: '', priority: 'medium', relatedTo: '', relatedType: 'client' })
    } catch (err) {
      toast.error(err.message || 'Erreur')
    }
  }

  const handleDelete = async (id) => {
    const ok = await confirm({ title: 'Supprimer la tâche', description: 'Cette action est irréversible.', confirmLabel: 'Supprimer' })
    if (ok) {
      try {
        await deleteTask(id)
        toast.success('Tâche supprimée')
      } catch (err) {
        toast.error(err.message || 'Erreur')
      }
    }
  }

  const filteredTasks = tasks.filter(task => {
    if (filter === 'completed' && !task.completed) return false
    if (filter === 'pending' && task.completed) return false
    if (priorityFilter !== 'all' && task.priority !== priorityFilter) return false
    return true
  })

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1
    if (a.dueDate && b.dueDate) return new Date(a.dueDate) - new Date(b.dueDate)
    return 0
  })

  const getPriorityColor = (p) => ({ low: 'badge-success', medium: 'badge-warning', high: 'badge-danger' }[p] || 'badge-warning')
  const getPriorityLabel = (p) => ({ low: 'Basse', medium: 'Moyenne', high: 'Haute' }[p] || 'Moyenne')

  const getDueDateLabel = (dueDate) => {
    if (!dueDate) return null
    const date = new Date(dueDate)
    if (isPast(date) && !isToday(date)) return { label: 'En retard', color: 'text-red-600' }
    if (isToday(date)) return { label: "Aujourd'hui", color: 'text-orange-600' }
    if (isTomorrow(date)) return { label: 'Demain', color: 'text-blue-600' }
    return { label: format(date, 'dd MMM yyyy', { locale: fr }), color: 'text-muted-foreground' }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-20" />)}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="page-title">Tâches et Rendez-vous</h1>
          <p className="page-subtitle">Gérez vos tâches et appointments</p>
        </div>
        <Button onClick={() => { setEditingTask(null); setFormData({ title: '', description: '', dueDate: '', priority: 'medium', relatedTo: '', relatedType: 'client' }); setIsDialogOpen(true) }}>
          <Plus className="h-4 w-4 mr-2" />Nouvelle tâche
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {['all', 'pending', 'completed'].map(f => (
          <Button key={f} variant={filter === f ? 'default' : 'outline'} size="sm" onClick={() => setFilter(f)}>
            {f === 'all' ? 'Toutes' : f === 'pending' ? 'En cours' : 'Complétées'}
          </Button>
        ))}
        <Select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} className="w-36">
          <option value="all">Toutes priorités</option>
          <option value="low">Basse</option>
          <option value="medium">Moyenne</option>
          <option value="high">Haute</option>
        </Select>
      </div>

      <div className="space-y-3">
        {sortedTasks.map((task) => {
          const dueDateInfo = getDueDateLabel(task.dueDate)
          return (
            <Card key={task.id} className={task.completed ? 'opacity-60' : ''}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <button onClick={async () => {
                      try {
                        await toggleTaskComplete(task.id)
                        toast.success(task.completed ? 'Tâche réouverte' : 'Tâche complétée')
                      } catch (err) {
                        toast.error(err.message || 'Erreur')
                      }
                    }} className="mt-1 shrink-0">
                      {task.completed ? <CheckCircle2 className="h-5 w-5 text-green-600" /> : <Circle className="h-5 w-5 text-muted-foreground" />}
                    </button>
                    <div className="min-w-0">
                      <h3 className={`font-medium ${task.completed ? 'line-through text-muted-foreground' : ''}`}>{task.title}</h3>
                      {task.description && <p className="text-sm text-muted-foreground mt-1">{task.description}</p>}
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        {dueDateInfo && (
                          <div className={`flex items-center text-sm ${dueDateInfo.color}`}>
                            <Calendar className="h-4 w-4 mr-1" />{dueDateInfo.label}
                          </div>
                        )}
                        <span className={getPriorityColor(task.priority)}>{getPriorityLabel(task.priority)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button variant="ghost" size="icon" onClick={() => { setEditingTask(task); setFormData(task); setIsDialogOpen(true) }}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(task.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {sortedTasks.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Aucune tâche pour le moment</p>
            <Button onClick={() => setIsDialogOpen(true)} className="mt-4">Ajouter votre première tâche</Button>
          </CardContent>
        </Card>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogClose onClick={() => setIsDialogOpen(false)} />
        <DialogHeader><DialogTitle>{editingTask ? 'Modifier la tâche' : 'Nouvelle tâche'}</DialogTitle></DialogHeader>
        <DialogContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div><label className="text-sm font-medium">Titre *</label><Input required value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} /></div>
            <div><label className="text-sm font-medium">Description</label><Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} /></div>
            <div><label className="text-sm font-medium">Date d&apos;échéance</label><Input type="datetime-local" value={formData.dueDate} onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })} /></div>
            <div>
              <label className="text-sm font-medium">Priorité</label>
              <Select value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: e.target.value })}>
                <option value="low">Basse</option>
                <option value="medium">Moyenne</option>
                <option value="high">Haute</option>
              </Select>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Annuler</Button>
              <Button type="submit">{editingTask ? 'Modifier' : 'Ajouter'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default Tasks
