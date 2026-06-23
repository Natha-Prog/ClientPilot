import { useState } from 'react'
import { useStore } from '../context/StoreContext'
import { useConfirm } from './ConfirmDialog'
import { Card, CardHeader, CardTitle, CardContent } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Skeleton } from './ui/skeleton'
import { Dialog, DialogHeader, DialogTitle, DialogContent, DialogFooter, DialogClose } from './ui/dialog'
import { Textarea } from './ui/textarea'
import { Select } from './ui/select'
import { Plus, Pencil, Trash2, Phone, Mail, Building, Users, Search } from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { toast } from 'sonner'

const Clients = () => {
  const { clients, loading, addClient, updateClient, deleteClient, addNote, getNotesForEntity, deleteNote } = useStore()
  const confirm = useConfirm()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingClient, setEditingClient] = useState(null)
  const [selectedClient, setSelectedClient] = useState(null)
  const [showNotes, setShowNotes] = useState(false)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [formErrors, setFormErrors] = useState({})
  const [formData, setFormData] = useState({
    name: '', company: '', email: '', phone: '', status: 'active', notes: ''
  })
  const [noteText, setNoteText] = useState('')

  const validate = () => {
    const errors = {}
    if (!formData.name.trim()) errors.name = 'Le nom est requis'
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Email invalide'
    }
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    try {
      if (editingClient) {
        await updateClient(editingClient.id, formData)
        toast.success('Client modifié')
      } else {
        await addClient(formData)
        toast.success('Client ajouté')
      }
      setIsDialogOpen(false)
      setEditingClient(null)
      setFormData({ name: '', company: '', email: '', phone: '', status: 'active', notes: '' })
      setFormErrors({})
    } catch (err) {
      toast.error(err.message || 'Erreur')
    }
  }

  const handleEdit = (client) => {
    setEditingClient(client)
    setFormData(client)
    setFormErrors({})
    setIsDialogOpen(true)
  }

  const handleDelete = async (id) => {
    const ok = await confirm({
      title: 'Supprimer le client',
      description: 'Cette action est irréversible.',
      confirmLabel: 'Supprimer',
    })
    if (ok) {
      try {
        await deleteClient(id)
        toast.success('Client supprimé')
      } catch (err) {
        toast.error(err.message || 'Erreur')
      }
    }
  }

  const handleAddNote = async () => {
    if (noteText.trim() && selectedClient) {
      try {
        await addNote({ entityId: selectedClient.id, entityType: 'client', content: noteText })
        setNoteText('')
        toast.success('Note ajoutée')
      } catch (err) {
        toast.error(err.message || 'Erreur')
      }
    }
  }

  const filteredClients = clients.filter(c => {
    const matchSearch = !search || c.name?.toLowerCase().includes(search.toLowerCase()) ||
      c.email?.toLowerCase().includes(search.toLowerCase()) || c.company?.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'all' || c.status === statusFilter
    return matchSearch && matchStatus
  })

  const clientNotes = selectedClient ? getNotesForEntity(selectedClient.id, 'client') : []

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-40" />)}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="page-title">Clients</h1>
          <p className="page-subtitle">Gérez vos clients existants</p>
        </div>
        <Button onClick={() => { setEditingClient(null); setFormData({ name: '', company: '', email: '', phone: '', status: 'active', notes: '' }); setFormErrors({}); setIsDialogOpen(true) }}>
          <Plus className="h-4 w-4 mr-2" />
          Nouveau client
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Rechercher..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full sm:w-40">
          <option value="all">Tous les statuts</option>
          <option value="active">Actif</option>
          <option value="inactive">Inactif</option>
        </Select>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredClients.map((client) => (
          <Card key={client.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => { setSelectedClient(client); setShowNotes(true) }}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-base">
                <span className="truncate">{client.name}</span>
                <div className="flex gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(client)}><Pencil className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(client.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {client.company && <div className="flex items-center text-sm text-muted-foreground"><Building className="h-4 w-4 mr-2 shrink-0" />{client.company}</div>}
              {client.email && <div className="flex items-center text-sm text-muted-foreground"><Mail className="h-4 w-4 mr-2 shrink-0" />{client.email}</div>}
              {client.phone && <div className="flex items-center text-sm text-muted-foreground"><Phone className="h-4 w-4 mr-2 shrink-0" />{client.phone}</div>}
              <div className="flex items-center justify-between pt-2">
                <span className={client.status === 'active' ? 'badge-success' : 'badge-muted'}>
                  {client.status === 'active' ? 'Actif' : 'Inactif'}
                </span>
                <span className="text-xs text-muted-foreground">{format(new Date(client.createdAt), 'dd MMM yyyy', { locale: fr })}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredClients.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">{clients.length === 0 ? 'Aucun client pour le moment' : 'Aucun résultat'}</p>
            {clients.length === 0 && (
              <Button onClick={() => setIsDialogOpen(true)} className="mt-4">Ajouter votre premier client</Button>
            )}
          </CardContent>
        </Card>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogClose onClick={() => setIsDialogOpen(false)} />
        <DialogHeader><DialogTitle>{editingClient ? 'Modifier le client' : 'Nouveau client'}</DialogTitle></DialogHeader>
        <DialogContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium">Nom *</label>
              <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Jean Dupont" />
              {formErrors.name && <p className="text-xs text-destructive mt-1">{formErrors.name}</p>}
            </div>
            <div>
              <label className="text-sm font-medium">Entreprise</label>
              <Input value={formData.company} onChange={(e) => setFormData({ ...formData, company: e.target.value })} placeholder="Acme Inc." />
            </div>
            <div>
              <label className="text-sm font-medium">Email</label>
              <Input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="jean@exemple.com" />
              {formErrors.email && <p className="text-xs text-destructive mt-1">{formErrors.email}</p>}
            </div>
            <div>
              <label className="text-sm font-medium">Téléphone</label>
              <Input value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="+33 6 12 34 56 78" />
            </div>
            <div>
              <label className="text-sm font-medium">Statut</label>
              <Select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}>
                <option value="active">Actif</option>
                <option value="inactive">Inactif</option>
              </Select>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Annuler</Button>
              <Button type="submit">{editingClient ? 'Modifier' : 'Ajouter'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={showNotes} onOpenChange={setShowNotes}>
        <DialogClose onClick={() => setShowNotes(false)} />
        <DialogHeader><DialogTitle>Notes — {selectedClient?.name}</DialogTitle></DialogHeader>
        <DialogContent>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Textarea value={noteText} onChange={(e) => setNoteText(e.target.value)} placeholder="Ajouter une note..." rows={2} />
              <Button onClick={handleAddNote} className="shrink-0">Ajouter</Button>
            </div>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {clientNotes.length === 0 ? (
                <p className="text-sm text-muted-foreground">Aucune note</p>
              ) : clientNotes.map((note) => (
                <div key={note.id} className="p-3 bg-muted rounded-lg">
                  <p className="text-sm">{note.content}</p>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs text-muted-foreground">{format(new Date(note.createdAt), 'dd MMM yyyy HH:mm', { locale: fr })}</span>
                    <Button variant="ghost" size="sm" onClick={async () => {
                      try {
                        await deleteNote(note.id)
                        toast.success('Note supprimée')
                      } catch (err) {
                        toast.error(err.message || 'Erreur')
                      }
                    }}><Trash2 className="h-3 w-3" /></Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default Clients
