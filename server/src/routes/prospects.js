import { Router } from 'express'
import { z } from 'zod'
import prisma from '../lib/prisma.js'
import { authenticate, userFilter } from '../middleware/auth.js'

const router = Router()
router.use(authenticate)

const prospectSchema = z.object({
  name: z.string().min(1),
  company: z.string().optional().nullable(),
  email: z.string().email().optional().nullable().or(z.literal('')),
  phone: z.string().optional().nullable(),
  source: z.string().optional().nullable(),
  status: z.enum(['new', 'contacted', 'qualified', 'lost']).optional(),
  notes: z.string().optional().nullable(),
})

router.get('/', async (req, res, next) => {
  try {
    const prospects = await prisma.prospect.findMany({
      where: userFilter(req),
      orderBy: { createdAt: 'desc' },
    })
    res.json(prospects)
  } catch (err) {
    next(err)
  }
})

router.post('/', async (req, res, next) => {
  try {
    const data = prospectSchema.parse(req.body)
    const prospect = await prisma.prospect.create({
      data: { ...data, email: data.email || null, userId: req.user.id },
    })
    res.status(201).json(prospect)
  } catch (err) {
    next(err)
  }
})

router.put('/:id', async (req, res, next) => {
  try {
    const data = prospectSchema.parse(req.body)
    const existing = await prisma.prospect.findFirst({
      where: { id: Number(req.params.id), ...userFilter(req) },
    })
    if (!existing) return res.status(404).json({ error: 'Prospect introuvable' })

    const prospect = await prisma.prospect.update({
      where: { id: existing.id },
      data: { ...data, email: data.email || null },
    })
    res.json(prospect)
  } catch (err) {
    next(err)
  }
})

router.delete('/:id', async (req, res, next) => {
  try {
    const existing = await prisma.prospect.findFirst({
      where: { id: Number(req.params.id), ...userFilter(req) },
    })
    if (!existing) return res.status(404).json({ error: 'Prospect introuvable' })

    await prisma.prospect.delete({ where: { id: existing.id } })
    res.json({ success: true })
  } catch (err) {
    next(err)
  }
})

router.post('/:id/convert', async (req, res, next) => {
  try {
    const existing = await prisma.prospect.findFirst({
      where: { id: Number(req.params.id), ...userFilter(req) },
    })
    if (!existing) return res.status(404).json({ error: 'Prospect introuvable' })

    const client = await prisma.$transaction(async (tx) => {
      const newClient = await tx.client.create({
        data: {
          name: existing.name,
          company: existing.company,
          email: existing.email,
          phone: existing.phone,
          notes: existing.notes,
          status: 'active',
          userId: existing.userId,
        },
      })
      await tx.prospect.delete({ where: { id: existing.id } })
      return newClient
    })
    res.status(201).json(client)
  } catch (err) {
    next(err)
  }
})

export default router
