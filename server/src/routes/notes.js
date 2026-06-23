import { Router } from 'express'
import { z } from 'zod'
import prisma from '../lib/prisma.js'
import { authenticate, userFilter } from '../middleware/auth.js'

const router = Router()
router.use(authenticate)

const noteSchema = z.object({
  content: z.string().min(1),
  entityType: z.string().optional(),
  entityId: z.number().optional().nullable(),
})

router.get('/', async (req, res, next) => {
  try {
    const notes = await prisma.note.findMany({
      where: userFilter(req),
      orderBy: { createdAt: 'desc' },
    })
    res.json(notes)
  } catch (err) {
    next(err)
  }
})

router.post('/', async (req, res, next) => {
  try {
    const data = noteSchema.parse(req.body)
    const note = await prisma.note.create({
      data: {
        content: data.content,
        entityType: data.entityType || 'general',
        entityId: data.entityId || null,
        userId: req.user.id,
      },
    })
    res.status(201).json(note)
  } catch (err) {
    next(err)
  }
})

router.delete('/:id', async (req, res, next) => {
  try {
    const existing = await prisma.note.findFirst({
      where: { id: Number(req.params.id), ...userFilter(req) },
    })
    if (!existing) return res.status(404).json({ error: 'Note introuvable' })

    await prisma.note.delete({ where: { id: existing.id } })
    res.json({ success: true })
  } catch (err) {
    next(err)
  }
})

export default router
