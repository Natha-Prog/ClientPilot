import { Router } from 'express'
import prisma from '../lib/prisma.js'
import { authenticate, userFilter } from '../middleware/auth.js'

const router = Router()
router.use(authenticate)

router.get('/stats', async (req, res, next) => {
  try {
    const filter = userFilter(req)
    const [clients, prospects, tasks] = await Promise.all([
      prisma.client.count({ where: filter }),
      prisma.prospect.count({ where: filter }),
      prisma.task.findMany({ where: filter, select: { completed: true } }),
    ])

    const pendingTasks = tasks.filter(t => !t.completed).length
    const completedTasks = tasks.filter(t => t.completed).length
    const conversionRate = prospects > 0
      ? ((clients / (clients + prospects)) * 100).toFixed(1)
      : '0'

    const prospectByStatus = await prisma.prospect.groupBy({
      by: ['status'],
      where: filter,
      _count: true,
    })

    res.json({
      clients,
      prospects,
      pendingTasks,
      completedTasks,
      conversionRate,
      prospectByStatus: prospectByStatus.map(s => ({ status: s.status, count: s._count })),
    })
  } catch (err) {
    next(err)
  }
})

export default router
