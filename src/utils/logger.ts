import logger from 'pino'
import dayjs from 'dayjs'

export default logger({
  ...(process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test'
    ? { transport: { target: 'pino-pretty' } }
    : {}),
  base: {
    pid: false,
  },
  timestamp: () => `,"time":"${dayjs().format()}"`,
  redact: [
    'req.headers.authorization',
    'req.headers["x-refresh-token"]',
    'req.headers["x-bungie-refresh-token"]',
  ],
})
