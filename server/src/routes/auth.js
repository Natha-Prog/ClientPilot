import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import prisma from '../lib/prisma.js'
import { signToken, cookieOptions, clearCookieOptions } from '../lib/jwt.js'
import { authenticate } from '../middleware/auth.js'

const router = Router()

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(1),
  role: z.enum(['admin', 'operator']).optional(),
})

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = loginSchema.parse(req.body)
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect' })
    }
    const token = signToken(user)
    res.cookie('token', token, cookieOptions)
    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      createdAt: user.createdAt,
      token,
    })
  } catch (err) {
    next(err)
  }
})

router.post('/register', async (req, res, next) => {
  try {
    const data = registerSchema.parse(req.body)
    const existing = await prisma.user.findUnique({ where: { email: data.email } })
    if (existing) return res.status(400).json({ error: 'Email déjà utilisé' })

    const passwordHash = await bcrypt.hash(data.password, 12)
    const user = await prisma.user.create({
      data: {
        email: data.email,
        passwordHash,
        name: data.name,
        role: data.role || 'operator',
      },
    })
    const token = signToken(user)
    res.cookie('token', token, cookieOptions)
    res.status(201).json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      createdAt: user.createdAt,
      token,
    })
  } catch (err) {
    next(err)
  }
})

router.post('/logout', (req, res) => {
  res.clearCookie('token', clearCookieOptions)
  res.json({ success: true })
})

router.get('/me', authenticate, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, email: true, name: true, role: true, createdAt: true },
    })
    if (!user) return res.status(401).json({ error: 'Utilisateur introuvable' })
    res.json(user)
  } catch (err) {
    next(err)
  }
})

export default router
