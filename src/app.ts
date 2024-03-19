import express from 'express'
import logger from './utils/logger.js'
import routes from './routes.js'
import deserializeUser from './middleware/deserializeUser.js'
import cors from 'cors'
import rateLimit from 'express-rate-limit'
import loadManifest from './utils/manifestHelpers.js'
import pinoHttp from 'pino-http'

export const app = express()

app.use(cors())
app.use(express.json())
app.set('trust proxy', process.env.TRUST_PROXIES || 0)

if (process.env.NODE_ENV !== 'test') {
  app.use(pinoHttp({ logger: logger }))
}

const dailyLimiter = rateLimit({
  windowMs: 12 * 60 * 60 * 1000,
  max: 100000,
  message: 'Daily request limit reached.',
})

const minuteLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 300,
})

if (process.env.NODE_ENV !== 'test') {
  app.use(dailyLimiter)
  app.use(minuteLimiter)
}

app.use(deserializeUser)

setInterval(
  () => {
    logger.info('Reloading manifest')
    loadManifest()
  },
  1000 * 60 * 60,
)

routes(app)
