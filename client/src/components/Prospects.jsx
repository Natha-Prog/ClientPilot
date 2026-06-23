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
import { Plus, Pencil, Trash2, Phone, Mail, Building, UserCheck, Users, Search } from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { toast } from 'sonner'

const statusColors = { new: 'badge-info', contacted: 'badge-warning', qualified: 'badge-success', lost: 'badge-danger' }
const statusLabels = { new: 'Nouveau', contacted: 'Contacté', qualified: 'Qualifié', lost: 'Perdu' }

const Prospects = () => {
  const { prospects, loading, addProspect, updateProspect, deleteProspect, convertProspectToClient, addNote, getNotesForEntity, deleteNote } = useStore()
  const confirm = useConfirm()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingProspect, setEditingProspect] = useState(null)
  const [selectedProspect, setSelectedProspect] = useState(null)
  const [showNotes, setShowNotes] = useState(false)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [formErrors, setFormErrors] = useState({})
  const [formData, setFormData] = useState({ name: '', company: '', email: '', phone: '', source: '', status: 'new', notes: '' })
  const [noteText, setNoteText] = useState('')

  const validate = () => {
    const errors = {}
    if (!formData.name.trim()) errors.name = 'Le nom est requis'
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errors.email = 'Email invalide'
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    try {
      if (editingProspect) {
        await updateProspect(editingProspect.id, formData)
        toast.success('Prospect modifié')
      } else {
        await addProspect(formData)
        toast.success('Prospect ajouté')
      }
      setIsDialogOpen(false)
      setEditingProspect(null)
      setFormData({ name: '', company: '', email: '', phone: '', source: '', status: 'new', notes: '' })
      setFormErrors({})
    } catch (err) {
      toast.error(err.message || 'Erreur')
    }
  }

  const handleDelete = async (id) => {
    const ok = await confirm({ title: 'Supprimer le prospect', description: 'Cette action est irréversible.', confirmLabel: 'Supprimer' })
    if (ok) {
      try {
        await deleteProspect(id)
        toast.success('Prospect supprimé')
      } catch (err) {
        toast.error(err.message || 'Erreur')
      }
    }
  }

  const handleConvert = async (prospect) => {
    const ok = await confirm({ title: 'Convertir en client', description: `Convertir ${prospect.name} en client ?`, confirmLabel: 'Convertir', variant: 'default' })
    if (ok) {
      try {
        await convertProspectToClient(prospect.id)
        toast.success('Prospect converti en client')
      } catch (err) {
        toast.error(err.message || 'Erreur')
      }
    }
  }

  const filteredProspects = prospects.filter(p => {
    const matchSearch = !search || p.name?.toLowerCase().includes(search.toLowerCase()) || p.email?.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'all' || p.status === statusFilter
    return matchSearch && matchStatus
  })

  const prospectNotes = selectedProspect ? getNotesForEntity(selectedProspect.id, 'prospect') : []

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
          <h1 className="page-title">Prospects</h1>
          <p className="page-subtitle">Gérez vos prospects et conversions</p>
        </div>
        <Button onClick={() => { setEditingProspect(null); setFormData({ name: '', company: '', email: '', phone: '', source: '', status: 'new', notes: '' }); setFormErrors({}); setIsDialogOpen(true) }}>
          <Plus className="h-4 w-4 mr-2" />Nouveau prospect
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Rechercher..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full sm:w-44">
          <option value="all">Tous les statuts</option>
          <option value="new">Nouveau</option>
          <option value="contacted">Contacté</option>
          <option value="qualified">Qualifié</option>
          <option value="lost">Perdu</option>
        </Select>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredProspects.map((prospect) => (
          <Card key={prospect.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => { setSelectedProspect(prospect); setShowNotes(true) }}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-base">
                <span className="truncate">{prospect.name}</span>
                <div className="flex gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                  <Button variant="ghost" size="icon" onClick={() => handleConvert(prospect)} title="Convertir en client">
                    <UserCheck className="h-4 w-4 text-brand-orange" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => { setEditingProspect(prospect); setFormData(prospect); setIsDialogOpen(true) }}><Pencil className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(prospect.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {prospect.company && <div className="flex items-center text-sm text-muted-foreground"><Building className="h-4 w-4 mr-2" />{prospect.company}</div>}
              {prospect.email && <div className="flex items-center text-sm text-muted-foreground"><Mail className="h-4 w-4 mr-2" />{prospect.email}</div>}
              {prospect.phone && <div className="flex items-center text-sm text-muted-foreground"><Phone className="h-4 w-4 mr-2" />{prospect.phone}</div>}
              <div className="flex items-center justify-between pt-2">
                <span className={statusColors[prospect.status]}>{statusLabels[prospect.status]}</span>
                <span className="text-xs text-muted-foreground">{format(new Date(prospect.createdAt), 'dd MMM yyyy', { locale: fr })}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProspects.length === 0 && (
        <Card className="border-dashed border-2 bg-muted/30">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="h-14 w-14 rounded-full bg-brand-orange/10 flex items-center justify-center mb-4">
              <Users className="h-7 w-7 text-brand-orange" />
            </div>
            <p className="font-medium text-brand-navy">{prospects.length === 0 ? 'Aucun prospect pour le moment' : 'Aucun résultat'}</p>
            <p className="text-sm text-muted-foreground mt-1 mb-4">Commencez par ajouter votre premier prospect</p>
            {prospects.length === 0 && (
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Ajouter un prospect
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogClose onClick={() => setIsDialogOpen(false)} />
        <DialogHeader><DialogTitle>{editingProspect ? 'Modifier le prospect' : 'Nouveau prospect'}</DialogTitle></DialogHeader>
        <DialogContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium">Nom *</label>
              <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
              {formErrors.name && <p className="text-xs text-destructive mt-1">{formErrors.name}</p>}
            </div>
            <div><label className="text-sm font-medium">Entreprise</label><Input value={formData.company} onChange={(e) => setFormData({ ...formData, company: e.target.value })} /></div>
            <div>
              <label className="text-sm font-medium">Email</label>
              <Input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
              {formErrors.email && <p className="text-xs text-destructive mt-1">{formErrors.email}</p>}
            </div>
            <div><label className="text-sm font-medium">Téléphone</label><Input value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} /></div>
            <div><label className="text-sm font-medium">Source</label><Input value={formData.source} onChange={(e) => setFormData({ ...formData, source: e.target.value })} placeholder="LinkedIn, Site web..." /></div>
            <div>
              <label className="text-sm font-medium">Statut</label>
              <Select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}>
                <option value="new">Nouveau</option>
                <option value="contacted">Contacté</option>
                <option value="qualified">Qualifié</option>
                <option value="lost">Perdu</option>
              </Select>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Annuler</Button>
              <Button type="submit">{editingProspect ? 'Modifier' : 'Ajouter'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={showNotes} onOpenChange={setShowNotes}>
        <DialogClose onClick={() => setShowNotes(false)} />
        <DialogHeader><DialogTitle>Notes — {selectedProspect?.name}</DialogTitle></DialogHeader>
        <DialogContent>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Textarea value={noteText} onChange={(e) => setNoteText(e.target.value)} placeholder="Ajouter une note..." rows={2} />
              <Button onClick={async () => {
                if (noteText.trim() && selectedProspect) {
                  try {
                    await addNote({ entityId: selectedProspect.id, entityType: 'prospect', content: noteText })
                    setNoteText('')
                    toast.success('Note ajoutée')
                  } catch (err) {
                    toast.error(err.message || 'Erreur')
                  }
                }
              }} className="shrink-0">Ajouter</Button>
            </div>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {prospectNotes.map((note) => (
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

export default Prospects
