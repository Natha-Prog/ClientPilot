import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import prisma from '../lib/prisma.js'
import { authenticate, requireAdmin } from '../middleware/auth.js'

const router = Router()
router.use(authenticate, requireAdmin)

const userSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  role: z.enum(['admin', 'operator']),
  password: z.string().min(6).optional(),
})

const userSelect = { id: true, email: true, name: true, role: true, createdAt: true }

router.get('/', async (req, res, next) => {
  try {
    const users = await prisma.user.findMany({ select: userSelect, orderBy: { createdAt: 'desc' } })
    res.json(users)
  } catch (err) {
    next(err)
  }
})

router.post('/', async (req, res, next) => {
  try {
    const data = userSchema.parse(req.body)
    if (!data.password) return res.status(400).json({ error: 'Mot de passe requis' })

    const existing = await prisma.user.findUnique({ where: { email: data.email } })
    if (existing) return res.status(400).json({ error: 'Email déjà utilisé' })

    const passwordHash = await bcrypt.hash(data.password, 12)
    const user = await prisma.user.create({
      data: { email: data.email, name: data.name, role: data.role, passwordHash },
      select: userSelect,
    })
    res.status(201).json(user)
  } catch (err) {
    next(err)
  }
})

router.put('/:id', async (req, res, next) => {
  try {
    const data = userSchema.parse(req.body)
    const updateData = { email: data.email, name: data.name, role: data.role }
    if (data.password) updateData.passwordHash = await bcrypt.hash(data.password, 12)

    const user = await prisma.user.update({
      where: { id: Number(req.params.id) },
      data: updateData,
      select: userSelect,
    })
    res.json(user)
  } catch (err) {
    next(err)
  }
})

router.delete('/:id', async (req, res, next) => {
  try {
    if (Number(req.params.id) === req.user.id) {
      return res.status(400).json({ error: 'Vous ne pouvez pas supprimer votre propre compte' })
    }
    await prisma.user.delete({ where: { id: Number(req.params.id) } })
    res.json({ success: true })
  } catch (err) {
    next(err)
  }
})

export default router
