import '../src/lib/env.js'
import { execSync } from 'child_process'

execSync('npx prisma migrate deploy', {
  stdio: 'inherit',
  env: process.env,
})
