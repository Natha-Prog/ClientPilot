import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useConfirm } from './ConfirmDialog'
import { api } from '../lib/api'
import { Card, CardHeader, CardTitle, CardContent } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Skeleton } from './ui/skeleton'
import { Dialog, DialogHeader, DialogTitle, DialogContent, DialogFooter, DialogClose } from './ui/dialog'
import { Select } from './ui/select'
import { Plus, Pencil, Trash2, Shield, User, Crown, Eye, EyeOff } from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { toast } from 'sonner'

const UserManagement = () => {
  const { user: currentUser } = useAuth()
  const confirm = useConfirm()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [formData, setFormData] = useState({ email: '', name: '', role: 'operator', password: '' })
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => { loadUsers() }, [])

  const loadUsers = async () => {
    setLoading(true)
    try {
      const data = await api.getUsers()
      setUsers(data)
    } catch (err) {
      toast.error(err.message || 'Erreur de chargement')
    }
    setLoading(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingUser) {
        await api.updateUser(editingUser.id, formData)
        toast.success('Utilisateur modifié')
      } else {
        if (!formData.password || formData.password.length < 6) {
          toast.error('Le mot de passe doit contenir au moins 6 caractères')
          return
        }
        await api.createUser(formData)
        toast.success('Utilisateur créé')
      }
    } catch (err) {
      toast.error(err.message || 'Erreur')
      return
    }
    loadUsers()
    setIsDialogOpen(false)
    setEditingUser(null)
    setFormData({ email: '', name: '', role: 'operator', password: '' })
  }

  const handleDelete = async (id) => {
    if (id === currentUser.id) { toast.error('Vous ne pouvez pas supprimer votre propre compte'); return }
    const ok = await confirm({ title: 'Supprimer l\'utilisateur', description: 'Cette action est irréversible.', confirmLabel: 'Supprimer' })
    if (!ok) return
    try {
      await api.deleteUser(id)
      toast.success('Utilisateur supprimé')
      loadUsers()
    } catch (err) {
      toast.error(err.message || 'Erreur')
    }
  }

  const getRoleIcon = (role) => role === 'admin' ? Crown : Shield
  const getRoleColor = (role) => role === 'admin' ? 'badge-brand' : 'badge-navy'
  const getRoleLabel = (role) => role === 'admin' ? 'Administrateur' : 'Opérateur'

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-36" />)}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="page-title">Gestion des utilisateurs</h1>
          <p className="page-subtitle">Gérez les comptes et les rôles</p>
        </div>
        <Button onClick={() => { setEditingUser(null); setFormData({ email: '', name: '', role: 'operator', password: '' }); setIsDialogOpen(true) }}>
          <Plus className="h-4 w-4 mr-2" />Nouvel utilisateur
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {users.map((user) => {
          const RoleIcon = getRoleIcon(user.role)
          return (
            <Card key={user.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-base">
                  <div className="flex items-center gap-2 min-w-0">
                    <User className="h-5 w-5 shrink-0" />
                    <span className="truncate">{user.name}</span>
                  </div>
                  {user.id !== currentUser.id && (
                    <div className="flex gap-1 shrink-0">
                      <Button variant="ghost" size="icon" onClick={() => { setEditingUser(user); setFormData({ email: user.email, name: user.name, role: user.role, password: '' }); setIsDialogOpen(true) }}><Pencil className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(user.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </div>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-sm text-muted-foreground truncate">{user.email}</div>
                <div className="flex items-center justify-between">
                  <span className={`${getRoleColor(user.role)} flex items-center gap-1`}>
                    <RoleIcon className="h-3 w-3" />{getRoleLabel(user.role)}
                  </span>
                  {user.id === currentUser.id && <span className="text-xs text-muted-foreground">(Vous)</span>}
                </div>
                <div className="text-xs text-muted-foreground">Créé le {format(new Date(user.createdAt), 'dd MMM yyyy', { locale: fr })}</div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogClose onClick={() => setIsDialogOpen(false)} />
        <DialogHeader><DialogTitle>{editingUser ? 'Modifier l\'utilisateur' : 'Nouvel utilisateur'}</DialogTitle></DialogHeader>
        <DialogContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div><label className="text-sm font-medium">Nom complet *</label><Input required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} /></div>
            <div><label className="text-sm font-medium">Email *</label><Input required type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} /></div>
            <div>
              <label className="text-sm font-medium">Rôle *</label>
              <Select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })}>
                <option value="operator">Opérateur</option>
                <option value="admin">Administrateur</option>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">{editingUser ? 'Nouveau mot de passe (vide = inchangé)' : 'Mot de passe *'}</label>
              <div className="relative">
                <Input
                  required={!editingUser}
                  type={showPassword ? 'text' : 'password'}
                  className="pr-10"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Annuler</Button>
              <Button type="submit">{editingUser ? 'Modifier' : 'Créer'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default UserManagement
