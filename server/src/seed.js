import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.join(__dirname, '../../.env') })
import bcrypt from 'bcryptjs'
import prisma from './lib/prisma.js'

async function seed() {
  const count = await prisma.user.count()
  if (count > 0) {
    console.log('Database already seeded, skipping.')
    return
  }

  const email = process.env.ADMIN_EMAIL || 'admin@clientpilot.com'
  const password = process.env.ADMIN_PASSWORD || 'admin123'
  const name = process.env.ADMIN_NAME || 'Administrateur'

  const passwordHash = await bcrypt.hash(password, 12)
  await prisma.user.create({
    data: { email, passwordHash, name, role: 'admin' },
  })

  console.log(`Admin user created: ${email}`)
}

seed()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
