import dotenv from 'dotenv'
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
dotenv.config({ path: path.join(__dirname, '../../.env') })

const app = express()
const PORT = process.env.PORT || 3001

// Accept one or more allowed origins (comma-separated in CLIENT_URL).
// e.g. CLIENT_URL="https://clientpilot-1.onrender.com,https://client-pilot.netlify.app"
const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean)

app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser requests (curl, server-to-server) with no Origin header.
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true)
    return callback(new Error(`Origin non autorisée par CORS: ${origin}`))
  },
  credentials: true,
}))
app.use(express.json())
app.use(cookieParser())

// API routes must be defined BEFORE static file serving
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
