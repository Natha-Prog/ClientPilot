import { verifyToken } from '../lib/jwt.js'

export const authenticate = (req, res, next) => {
  const token = req.cookies?.token || req.headers.authorization?.replace('Bearer ', '')
  if (!token) return res.status(401).json({ error: 'Non authentifié' })

  try {
    req.user = verifyToken(token)
    next()
  } catch {
    return res.status(401).json({ error: 'Session expirée' })
  }
}

export const requireAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Accès refusé' })
  }
  next()
}

export const userFilter = (req) => {
  if (req.user.role === 'admin') return {}
  return { userId: req.user.id }
}
