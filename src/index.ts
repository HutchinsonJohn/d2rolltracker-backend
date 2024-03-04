import * as dotenv from 'dotenv'
dotenv.config()
import { app } from './app.js'
import connect from './utils/connect.js'
import logger from './utils/logger.js'
import loadManifest from './utils/manifestHelpers.js'

const port = process.env.PORT

async function main() {
  const results = await Promise.allSettled([loadManifest(), connect()])
  const failedResults = results.filter((result) => result.status === 'rejected')
  if (failedResults.length > 0) {
    logger.error(failedResults)
    process.exit(1)
  }

  app.listen(port, async () => {
    logger.info(`Begin listening`)
  })
}
main()
