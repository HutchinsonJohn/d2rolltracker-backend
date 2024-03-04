import _ from 'lodash'
import { Request, Response, NextFunction } from 'express'
import { verifyJwt } from '../utils/jwt.js'
import getFreshTokensFromRefreshTokens from '../utils/refresh.js'

export default async (req: Request, res: Response, next: NextFunction) => {
  const accessToken = _.get(req, 'headers.authorization', '').replace(
    /^Bearer\s/,
    '',
  )

  const refreshToken = _.get(req, 'headers.x-refresh-token')?.toString()
  const bungieTokens = _.get(req, 'headers.x-bungie-refresh-token')?.toString()

  if (!accessToken) {
    return next()
  }

  const { decoded, isExpired } = verifyJwt(
    accessToken,
    'ACCESS_TOKEN_PUBLIC_KEY',
  )

  if (decoded) {
    res.locals.user = decoded
    return next()
  }

  if (isExpired && refreshToken) {
    const { newTokens, newBungieTokens } =
      await getFreshTokensFromRefreshTokens(refreshToken, bungieTokens)

    if (newBungieTokens) {
      res.setHeader('x-bungie-tokens', JSON.stringify(newBungieTokens))
    }

    if (newTokens) {
      res.setHeader('x-access-token', newTokens.accessToken)
      res.setHeader('x-refresh-token', newTokens.refreshToken)

      const result = verifyJwt(newTokens.accessToken, 'ACCESS_TOKEN_PUBLIC_KEY')

      res.locals.user = result.decoded
    }
  }

  return next()
}
