import { Request, Response, NextFunction } from 'express'

export default (req: Request, res: Response, next: NextFunction) => {
  const user = res.locals.user

  if (!user) {
    return res.status(403).send('User must be logged in.')
  }

  return next()
}
