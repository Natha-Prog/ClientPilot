import { useState } from 'react'
import { useStore } from '../context/StoreContext'
import { useConfirm } from './ConfirmDialog'
import { Card, CardHeader, CardTitle, CardContent } from './ui/card'
import { Button } from './ui/button'
import { Skeleton } from './ui/skeleton'
import { Dialog, DialogHeader, DialogTitle, DialogContent, DialogFooter, DialogClose } from './ui/dialog'
import { Textarea } from './ui/textarea'
import { Plus, Trash2, FileText } from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { toast } from 'sonner'

const Notes = () => {
  const { notes, loading, addNote, deleteNote } = useStore()
  const confirm = useConfirm()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [formData, setFormData] = useState({ content: '', entityId: '', entityType: 'general' })

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.content.trim()) { toast.error('Le contenu est requis'); return }
    try {
      await addNote(formData)
      toast.success('Note ajoutée')
      setIsDialogOpen(false)
      setFormData({ content: '', entityId: '', entityType: 'general' })
    } catch (err) {
      toast.error(err.message || 'Erreur')
    }
  }

  const handleDelete = async (id) => {
    const ok = await confirm({ title: 'Supprimer la note', description: 'Cette action est irréversible.', confirmLabel: 'Supprimer' })
    if (ok) {
      try {
        await deleteNote(id)
        toast.success('Note supprimée')
      } catch (err) {
        toast.error(err.message || 'Erreur')
      }
    }
  }

  const generalNotes = notes.filter(n => n.entityType === 'general' || !n.entityType)

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-32" />)}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="page-title">Notes</h1>
          <p className="page-subtitle">Notes générales et historique</p>
        </div>
        <Button onClick={() => { setFormData({ content: '', entityId: '', entityType: 'general' }); setIsDialogOpen(true) }}>
          <Plus className="h-4 w-4 mr-2" />Nouvelle note
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {generalNotes.map((note) => (
          <Card key={note.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-base">
                <span className="flex items-center gap-2"><FileText className="h-4 w-4" />Note</span>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(note.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm whitespace-pre-wrap">{note.content}</p>
              <p className="text-xs text-muted-foreground mt-4">{format(new Date(note.createdAt), 'dd MMM yyyy HH:mm', { locale: fr })}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {generalNotes.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Aucune note pour le moment</p>
            <Button onClick={() => setIsDialogOpen(true)} className="mt-4">Ajouter votre première note</Button>
          </CardContent>
        </Card>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogClose onClick={() => setIsDialogOpen(false)} />
        <DialogHeader><DialogTitle>Nouvelle note</DialogTitle></DialogHeader>
        <DialogContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium">Contenu *</label>
              <Textarea required value={formData.content} onChange={(e) => setFormData({ ...formData, content: e.target.value })} rows={5} placeholder="Votre note..." />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Annuler</Button>
              <Button type="submit">Ajouter</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default Notes
