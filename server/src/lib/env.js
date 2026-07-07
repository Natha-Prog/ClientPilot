import dotenv from 'dotenv'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

// Loaded as the very first import so environment variables (DATABASE_URL,
// JWT_SECRET, …) are available before any module reads process.env.
// On hosted platforms (Railway/Render) the variables come from the process
// environment directly, so a missing .env file is not an error.
const __dirname = path.dirname(fileURLToPath(import.meta.url))

const candidates = [
  path.join(__dirname, '../../../.env'), // repo root
  path.join(__dirname, '../../.env'), // server/.env
]

for (const envPath of candidates) {
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath })
    break
  }
}
