import { Router } from 'express'
import { z } from 'zod'
import prisma from '../lib/prisma.js'
import { authenticate, userFilter } from '../middleware/auth.js'

const router = Router()
router.use(authenticate)

const taskSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional().nullable(),
  dueDate: z.string().optional().nullable(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  completed: z.boolean().optional(),
  relatedTo: z.string().optional().nullable(),
  relatedType: z.string().optional().nullable(),
  clientId: z.number().optional().nullable(),
  prospectId: z.number().optional().nullable(),
})

router.get('/', async (req, res, next) => {
  try {
    const tasks = await prisma.task.findMany({
      where: userFilter(req),
      orderBy: { createdAt: 'desc' },
    })
    res.json(tasks.map(t => ({
      ...t,
      dueDate: t.dueDate ? t.dueDate.toISOString().slice(0, 16) : null,
    })))
  } catch (err) {
    next(err)
  }
})

router.post('/', async (req, res, next) => {
  try {
    const data = taskSchema.parse(req.body)
    const task = await prisma.task.create({
      data: {
        ...data,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        userId: req.user.id,
      },
    })
    res.status(201).json({
      ...task,
      dueDate: task.dueDate ? task.dueDate.toISOString().slice(0, 16) : null,
    })
  } catch (err) {
    next(err)
  }
})

router.put('/:id', async (req, res, next) => {
  try {
    const data = taskSchema.parse(req.body)
    const existing = await prisma.task.findFirst({
      where: { id: Number(req.params.id), ...userFilter(req) },
    })
    if (!existing) return res.status(404).json({ error: 'Tâche introuvable' })

    const task = await prisma.task.update({
      where: { id: existing.id },
      data: {
        ...data,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
      },
    })
    res.json({
      ...task,
      dueDate: task.dueDate ? task.dueDate.toISOString().slice(0, 16) : null,
    })
  } catch (err) {
    next(err)
  }
})

router.delete('/:id', async (req, res, next) => {
  try {
    const existing = await prisma.task.findFirst({
      where: { id: Number(req.params.id), ...userFilter(req) },
    })
    if (!existing) return res.status(404).json({ error: 'Tâche introuvable' })

    await prisma.task.delete({ where: { id: existing.id } })
    res.json({ success: true })
  } catch (err) {
    next(err)
  }
})

export default router
