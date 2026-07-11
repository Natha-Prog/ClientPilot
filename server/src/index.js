import './lib/env.js'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'
import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { errorHandler } from './middleware/errorHandler.js'
import authRoutes from './routes/auth.js'
import clientRoutes from './routes/clients.js'
import prospectRoutes from './routes/prospects.js'
import taskRoutes from './routes/tasks.js'
import noteRoutes from './routes/notes.js'
import userRoutes from './routes/users.js'
import dashboardRoutes from './routes/dashboard.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const app = express()
const PORT = process.env.PORT || 3001

// Accept one or more allowed origins (comma-separated in CLIENT_URL).
// Railway/Render public URLs are auto-added for full-stack deploys.
function getAllowedOrigins() {
  const origins = (process.env.CLIENT_URL || 'http://localhost:5173')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean)

  if (process.env.RAILWAY_PUBLIC_DOMAIN) {
    origins.push(`https://${process.env.RAILWAY_PUBLIC_DOMAIN}`)
  }
  if (process.env.RAILWAY_STATIC_URL) {
    origins.push(process.env.RAILWAY_STATIC_URL.replace(/\/$/, ''))
  }
  if (process.env.RENDER_EXTERNAL_URL) {
    origins.push(process.env.RENDER_EXTERNAL_URL.replace(/\/$/, ''))
  }

  return [...new Set(origins)]
}

const allowedOrigins = getAllowedOrigins()

// Vercel/Railway generate per-deployment (preview) subdomains. Allow them by
// hostname suffix so preview URLs don't each need to be listed in CLIENT_URL.
const allowedHostSuffixes = ['.vercel.app', '.up.railway.app', '.netlify.app', '.onrender.com']

function isOriginAllowed(origin) {
  if (allowedOrigins.includes(origin)) return true
  try {
    const { protocol, hostname } = new URL(origin)
    if (protocol !== 'https:') return false
    return allowedHostSuffixes.some(
      (suffix) => hostname === suffix.slice(1) || hostname.endsWith(suffix),
    )
  } catch {
    return false
  }
}

app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser requests (curl, server-to-server) with no Origin header.
    if (!origin || isOriginAllowed(origin)) return callback(null, true)
    return callback(new Error(`Origin non autorisée par CORS: ${origin}`))
  },
  credentials: true,
}))
app.use(express.json())
app.use(cookieParser())

// API routes must be defined BEFORE static file serving
app.get('/api/health', (_req, res) => {
  res.json({ ok: true })
})
app.use('/api/auth', authRoutes)
app.use('/api/clients', clientRoutes)
app.use('/api/prospects', prospectRoutes)
app.use('/api/tasks', taskRoutes)
app.use('/api/notes', noteRoutes)
app.use('/api/users', userRoutes)
app.use('/api/dashboard', dashboardRoutes)

// Serve the built frontend when available (single-server deployments)
const clientDist = path.join(__dirname, '../../client/dist')
const isProduction = process.env.NODE_ENV === 'production'
const distExists = fs.existsSync(clientDist)

if (isProduction || distExists) {
  app.use(express.static(clientDist))

  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next()
    res.sendFile(path.join(clientDist, 'index.html'), (err) => {
      if (err) res.status(404).send('Not found')
    })
  })
}

app.use(errorHandler)

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`)
})
