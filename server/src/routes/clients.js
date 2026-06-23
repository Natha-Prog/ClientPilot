import { Router } from 'express'
import { z } from 'zod'
import prisma from '../lib/prisma.js'
import { authenticate, userFilter } from '../middleware/auth.js'

const router = Router()
router.use(authenticate)

const clientSchema = z.object({
  name: z.string().min(1),
  company: z.string().optional().nullable(),
  email: z.string().email().optional().nullable().or(z.literal('')),
  phone: z.string().optional().nullable(),
  status: z.enum(['active', 'inactive']).optional(),
  notes: z.string().optional().nullable(),
})

router.get('/', async (req, res, next) => {
  try {
    const clients = await prisma.client.findMany({
      where: userFilter(req),
      orderBy: { createdAt: 'desc' },
    })
    res.json(clients)
  } catch (err) {
    next(err)
  }
})

router.post('/', async (req, res, next) => {
  try {
    const data = clientSchema.parse(req.body)
    const client = await prisma.client.create({
      data: { ...data, email: data.email || null, userId: req.user.id },
    })
    res.status(201).json(client)
  } catch (err) {
    next(err)
  }
})

router.put('/:id', async (req, res, next) => {
  try {
    const data = clientSchema.parse(req.body)
    const existing = await prisma.client.findFirst({
      where: { id: Number(req.params.id), ...userFilter(req) },
    })
    if (!existing) return res.status(404).json({ error: 'Client introuvable' })

    const client = await prisma.client.update({
      where: { id: existing.id },
      data: { ...data, email: data.email || null },
    })
    res.json(client)
  } catch (err) {
    next(err)
  }
})

router.delete('/:id', async (req, res, next) => {
  try {
    const existing = await prisma.client.findFirst({
      where: { id: Number(req.params.id), ...userFilter(req) },
    })
    if (!existing) return res.status(404).json({ error: 'Client introuvable' })

    await prisma.client.delete({ where: { id: existing.id } })
    res.json({ success: true })
  } catch (err) {
    next(err)
  }
})

export default router
