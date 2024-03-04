import mongoose from 'mongoose'
import logger from './logger.js'

export default async function connect(retry = 0) {
  const dbUri = process.env.DB_URI as string
  logger.info(`Trying to connect`)
  try {
    await mongoose.connect(dbUri)
    logger.info('Connected to db')
  } catch (error) {
    logger.error('Could not connect to db')
    logger.error(error)
    if (retry < 2) {
      logger.info('Retrying')
      return connect(retry + 1)
    }
    throw error
  }
}
