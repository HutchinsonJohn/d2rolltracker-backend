import { NextFunction, Request, Response } from 'express'
import { AnyZodObject, ZodError } from 'zod'
import logger from '../utils/logger.js'

export default (schema: AnyZodObject) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      })
      return next()
    } catch (e) {
      if (e instanceof ZodError) {
        return res.status(400).send(e.errors)
      }
      logger.error(e)
      return res.status(400).send('An unknown error occurred')
    }
  }
