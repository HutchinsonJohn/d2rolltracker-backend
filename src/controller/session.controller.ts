import { Request, Response } from 'express'
import _ from 'lodash'
import { createList } from '../service/list.service.js'
import { createSession, updateSession } from '../service/session.service.js'
import { createUser, findUser, updateUser } from '../service/user.service.js'
import {
  getTokensFromCode,
  getDestinyMembershipDetails as getDestinyMembershipsDetails,
} from '../utils/bungie.js'
import { signJwt } from '../utils/jwt.js'
import logger from '../utils/logger.js'
import getFreshTokensFromRefreshTokens from '../utils/refresh.js'

export async function createSessionHandler(req: Request, res: Response) {
  logger.info('Begin session handler')
  // Validate code with bungie
  const bungieTokens = await getTokensFromCode(req.body.code)
  // if tokens not valid 401
  if (!bungieTokens) {
    return res.status(401).send('Could not get login details from code')
  }

  let user = await findUser({
    bungieMembershipId: bungieTokens.bungieMembershipId,
  })

  let destinyMembershipsDetails
  try {
    destinyMembershipsDetails = await getDestinyMembershipsDetails(
      bungieTokens.accessToken.token,
    )
  } catch (error) {
    return res.status(401).send('Could not get destiny membership data')
  }

  if (destinyMembershipsDetails == null) {
    return res.status(401).send('Could not get destiny membership data')
  }

  if (!user) {
    user = await createUser({
      bungieMembershipId: bungieTokens.bungieMembershipId,
      ...destinyMembershipsDetails,
    })
    const list = await createList({
      listName: 'Personal List',
      createdBy: user._id,
      isPrivate: true,
    })
    user = await updateUser(
      { _id: user._id },
      { privateListId: list },
      { new: true },
    )
  } else {
    user = await updateUser(
      { _id: user._id },
      { ...destinyMembershipsDetails },
      { new: true },
    )
  }

  if (!user) {
    return res.status(401).send('Could not get user data')
  }

  // create a session
  const session = await createSession(user._id, req.get('user-agent') || '')

  // create an access token
  const accessToken = signJwt(
    { ...user.toObject(), session: session },
    'ACCESS_TOKEN_PRIVATE_KEY',
    { expiresIn: bungieTokens.accessToken.expiresIn },
  )

  // create a refresh token
  const refreshToken = signJwt(
    { ...user.toObject(), session: session },
    'REFRESH_TOKEN_PRIVATE_KEY',
    { expiresIn: bungieTokens.refreshToken.expiresIn },
  )

  // return access and refresh tokens
  return res.send({
    accessToken,
    refreshToken,
    bungieTokens,
  })
}

export async function deleteSessionHandler(req: Request, res: Response) {
  const sessionId = res.locals.user.session

  await updateSession({ _id: sessionId }, { isValid: false })

  return res.sendStatus(200)
}

export async function refreshTokenHandler(req: Request, res: Response) {
  const refreshToken = _.get(req, 'headers.x-refresh-token')?.toString()
  const bungieRefreshToken = _.get(
    req,
    'headers.x-bungie-refresh-token',
  )?.toString()

  if (refreshToken == null) {
    return res
      .status(404)
      .send('Refresh token was not sent, please sign in again')
  }

  const tokens = await getFreshTokensFromRefreshTokens(
    refreshToken,
    bungieRefreshToken,
  )
  if (tokens.newTokens == null) {
    return res.status(404).send('Invalid login session, please sign in again')
  }
  const bungieTokens = tokens.newBungieTokens

  return res.send({
    accessToken: tokens.newTokens.accessToken,
    refreshToken: tokens.newTokens.refreshToken,
    bungieTokens,
  })
}
