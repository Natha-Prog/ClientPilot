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

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}))
app.use(express.json())
app.use(cookieParser())

if (process.env.NODE_ENV === 'production') {
  const clientDist = path.join(__dirname, '../../client/dist')
  console.log('NODE_ENV:', process.env.NODE_ENV)
  console.log('Serving static files from:', clientDist)
  console.log('Dist directory exists:', fs.existsSync(clientDist))
  
  if (fs.existsSync(clientDist)) {
    const files = fs.readdirSync(clientDist)
    console.log('Files in dist:', files)
  }
  
  app.use(express.static(clientDist))
  
  app.get('*', (req, res) => {
    console.log('Request path:', req.path)
    console.log('Request method:', req.method)
    if (!req.path.startsWith('/api')) {
      console.log('Serving index.html for:', req.path)
      res.sendFile(path.join(clientDist, 'index.html'), (err) => {
        if (err) {
          console.error('Error serving index.html:', err)
          res.status(404).send('Not found')
        }
      })
    }
  })
}

app.use('/api/auth', authRoutes)
app.use('/api/clients', clientRoutes)
app.use('/api/prospects', prospectRoutes)
app.use('/api/tasks', taskRoutes)
app.use('/api/notes', noteRoutes)
app.use('/api/users', userRoutes)
app.use('/api/dashboard', dashboardRoutes)

app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
