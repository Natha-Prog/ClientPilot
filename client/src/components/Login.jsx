import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { Card, CardHeader, CardTitle, CardContent } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Lock, Mail, User, Eye, EyeOff } from 'lucide-react'

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
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

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

  const particles = [
    { left: '8%', delay: '0s', duration: '14s' },
    { left: '20%', delay: '3s', duration: '18s' },
    { left: '34%', delay: '6s', duration: '15s' },
    { left: '48%', delay: '1.5s', duration: '20s' },
    { left: '62%', delay: '4.5s', duration: '16s' },
    { left: '76%', delay: '2s', duration: '19s' },
    { left: '88%', delay: '5.5s', duration: '13s' },
    { left: '94%', delay: '7s', duration: '17s' },
  ]

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <div className="auth-bg">
        <div className="auth-grid" />
        <div className="auth-orb auth-orb-1" />
        <div className="auth-orb auth-orb-2" />
        <div className="auth-orb auth-orb-3" />
        {particles.map((p, i) => (
          <span
            key={i}
            className="auth-particle"
            style={{ left: p.left, bottom: '-10px', animationDelay: p.delay, animationDuration: p.duration }}
          />
        ))}
      </div>
      <Card className="w-full max-w-md shadow-2xl border-0 relative z-10 backdrop-blur-sm bg-card/95">
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
                  type={showPassword ? 'text' : 'password'}
                  className="pl-10 pr-10"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
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
            {!isLogin && (
              <div>
                <label className="text-sm font-medium">Confirmer le mot de passe *</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    required
                    type={showConfirmPassword ? 'text' : 'password'}
                    className="pl-10 pr-10"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
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
          {import.meta.env.VITE_SHOW_DEMO_CREDENTIALS !== 'false' && (
            <div className="mt-6 pt-6 border-t text-center text-xs text-muted-foreground">
              <p>Compte de démonstration :</p>
              <p className="font-mono mt-1">admin@clientpilot.com / admin123</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default Login
