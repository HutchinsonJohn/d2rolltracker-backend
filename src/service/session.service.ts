import _ from 'lodash'
import { FilterQuery, Types, UpdateQuery } from 'mongoose'
import SessionModel, { SessionDocument } from '../models/session.model.js'
import { signJwt, verifyJwt } from '../utils/jwt.js'
import { findUser } from './user.service.js'

export async function createSession(user: Types.ObjectId, userAgent: string) {
  const session = await SessionModel.create({
    user: user,
    userAgent: userAgent,
  })

  return session.toJSON()
}

export async function updateSession(
  query: FilterQuery<SessionDocument>,
  update: UpdateQuery<SessionDocument>,
) {
  return SessionModel.updateOne(query, update)
}

export async function reissueAccessToken(
  refreshToken: string,
  accessTokenExpiresIn?: number,
  refreshTokenExpiresIn?: number,
) {
  const { decoded } = verifyJwt(refreshToken, 'REFRESH_TOKEN_PUBLIC_KEY')
  if (!decoded || !_.get(decoded, 'session')) {
    return null
  }

  const session = await SessionModel.findById(_.get(decoded, 'session'))
  if (!session || !session.isValid) {
    return null
  }

  const user = await findUser({ _id: session.user })
  if (!user) {
    return null
  }

  const accessToken = signJwt(
    { ...user.toObject(), session: session._id },
    'ACCESS_TOKEN_PRIVATE_KEY',
    { expiresIn: accessTokenExpiresIn || 3600 }, // 60 minutes
  )

  const newRefreshToken = signJwt(
    { ...user.toObject(), session: session._id },
    'REFRESH_TOKEN_PRIVATE_KEY',
    {
      expiresIn: refreshTokenExpiresIn || 7776000,
    }, // 90 days
  )

  return { accessToken, refreshToken: newRefreshToken }
}
