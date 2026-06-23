import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { Card, CardHeader, CardTitle, CardContent } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Lock, Mail, User } from 'lucide-react'

const Login = () => {
  const { login, register } = useAuth()
  const [isLogin, setIsLogin] = useState(true)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    confirmPassword: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (isLogin) {
      const result = await login(formData.email, formData.password)
      if (!result.success) setError(result.error)
    } else {
      if (!formData.name.trim()) {
        setError('Le nom est requis')
        setLoading(false)
        return
      }
      if (formData.password !== formData.confirmPassword) {
        setError('Les mots de passe ne correspondent pas')
        setLoading(false)
        return
      }
      if (formData.password.length < 6) {
        setError('Le mot de passe doit contenir au moins 6 caractères')
        setLoading(false)
        return
      }
      const result = await register(formData.email, formData.password, formData.name, 'operator')
      if (!result.success) setError(result.error)
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-navy p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-brand-navy via-brand-navy-light/30 to-brand-navy opacity-90" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-brand-orange/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <Card className="w-full max-w-md shadow-2xl border-0 relative z-10">
        <CardHeader className="text-center pb-2">
          <div className="flex justify-center mb-2">
            <img src="/logo.png" alt="ClientPilot" className="h-24 w-auto object-contain" />
          </div>
          <CardTitle className="text-2xl text-brand-navy">ClientPilot</CardTitle>
          <p className="text-muted-foreground text-sm">
            {isLogin ? 'Connectez-vous à votre compte' : 'Créez votre compte'}
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="text-sm font-medium">Nom complet *</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    required
                    className="pl-10"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Jean Dupont"
                  />
                </div>
              </div>
            )}
            <div>
              <label className="text-sm font-medium">Email *</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  required
                  type="email"
                  className="pl-10"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="jean@exemple.com"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Mot de passe *</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  required
                  type="password"
                  className="pl-10"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                  minLength={6}
                />
              </div>
            </div>
            {!isLogin && (
              <div>
                <label className="text-sm font-medium">Confirmer le mot de passe *</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    required
                    type="password"
                    className="pl-10"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    placeholder="••••••••"
                  />
                </div>
              </div>
            )}
            {error && (
              <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                {error}
              </div>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Chargement...' : isLogin ? 'Se connecter' : "S'inscrire"}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin)
                setError('')
                setFormData({ email: '', password: '', name: '', confirmPassword: '' })
              }}
              className="text-primary hover:underline"
            >
              {isLogin ? "Pas encore de compte ? S'inscrire" : 'Déjà un compte ? Se connecter'}
            </button>
          </div>
          {import.meta.env.DEV && (
            <div className="mt-6 pt-6 border-t text-center text-xs text-muted-foreground">
              <p>Compte admin (dev uniquement):</p>
              <p className="font-mono mt-1">admin@clientpilot.com / admin123</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default Login
