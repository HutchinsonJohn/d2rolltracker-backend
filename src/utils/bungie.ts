import axios from 'axios'
import {
  getMembershipDataForCurrentUser,
  UserMembershipData,
  HttpClientConfig,
} from 'bungie-api-ts/user'
import { DestinyMembershipDetails } from '../models/user.model.js'
import logger from '../utils/logger.js'

export type TokenType = 'access' | 'refresh'

export interface Token {
  token: string
  type: TokenType
  createdAt: number
  expiresIn: number
}

export interface Tokens {
  accessToken: Token
  refreshToken: Token
  bungieMembershipId: string
}

export function fetchWithAccessToken(accessToken: string) {
  return async (config: HttpClientConfig) => {
    logger.info(`accessing ${config.url}?${new URLSearchParams(config.params)}`)
    const response = await axios(config.url, {
      params: new URLSearchParams(config.params),
      method: config.method,
      headers: {
        'X-API-Key': `${process.env.X_API_KEY}`,
        Authorization: `Bearer ${accessToken}`,
      },
    })
      .then((response) => {
        logger.info(`Fetch with access token status: ${response.status}`)
        return response.data
      })
      .catch((error) => {
        logger.error(error)
      })
    return response
  }
}

function createTokensFromResponse(
  response:
    | {
        access_token: string
        expires_in: number
        membership_id: string
        refresh_token: string
        refresh_expires_in: number
      }
    | undefined,
) {
  if (response == null) {
    logger.info('Error')
    throw new Error(JSON.stringify(response))
  }
  const now = Date.now()
  const accessToken: Token = {
    token: response.access_token,
    type: 'access',
    expiresIn: response.expires_in,
    createdAt: now,
  }
  const refreshToken: Token = {
    token: response.refresh_token,
    type: 'refresh',
    expiresIn: response.refresh_expires_in,
    createdAt: now,
  }
  const tokens: Tokens = {
    accessToken,
    refreshToken,
    bungieMembershipId: response.membership_id,
  }
  return tokens
}

export async function getTokensFromCode(code: string) {
  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
  })

  const tokens = await axios(
    'https://www.bungie.net/platform/app/oauth/token/',
    {
      method: 'POST',
      data: body,
      headers: {
        Authorization: `Basic ${Buffer.from(
          `${process.env.OAUTH_ID}:${process.env.OAUTH_SECRET}`,
        ).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    },
  )
    .then((response) => {
      logger.info(`Tokens from code status: ${response.status}`)
      return response.data
    })
    .then(createTokensFromResponse)
    .catch((error) => {
      logger.error(error)
    })

  return tokens
}

function createDestinyMembershipDetailsFromResponse(
  response: UserMembershipData,
) {
  if (response == null) {
    throw new Error(JSON.stringify(response))
  }

  // Logic derives from
  // https://github.com/Bungie-net/api/wiki/FAQ:-Cross-Save-pre-launch-testing,-and-how-it-may-affect-you#determining-the-platforms-on-which-a-destiny-profile-can-play
  const destinyMembershipsDetails = response.destinyMemberships
    .map((destinyMembership) => {
      if (destinyMembership.applicableMembershipTypes.length > 0) {
        const { membershipType, membershipId, displayName, iconPath } =
          destinyMembership
        const displayNameCode = destinyMembership.bungieGlobalDisplayNameCode
        return {
          membershipType,
          membershipId,
          displayName,
          iconPath,
          displayNameCode,
        }
      }
    })
    .filter(
      (destinyMembership): destinyMembership is DestinyMembershipDetails =>
        !!destinyMembership,
    )

  /** If cross save is enabled, uses primary membership, if it is not enabled
    defaults to destinyMembership at first position with an
    applicableMembershipType, can be changed by user later.  The check for
    applicableMembershipTypes is only necessary if cross save can be enabled
    only for specific platforms
  */
  const destinyMembership =
    response.destinyMemberships.find((destinyMembership) => {
      destinyMembership.membershipId === response.primaryMembershipId
    }) ||
    response.destinyMemberships.find(
      (destinyMembership) =>
        destinyMembership.applicableMembershipTypes.length > 0,
    )
  if (destinyMembership == null) {
    // Player likely has no destiny accounts
    throw new Error('No Destiny account found')
  }
  const defaultDestinyMembershipType = destinyMembership.membershipType
  const defaultDestinyMembershipId = destinyMembership.membershipId
  const displayName =
    destinyMembership.bungieGlobalDisplayName || destinyMembership.displayName
  const displayNameCode = destinyMembership.bungieGlobalDisplayNameCode
  const profilePicturePath = response.bungieNetUser.profilePicturePath
  return {
    defaultDestinyMembershipType,
    defaultDestinyMembershipId,
    displayName,
    displayNameCode,
    profilePicturePath,
    destinyMembershipsDetails,
  }
}

export async function getDestinyMembershipDetails(accessToken: string) {
  const userMembershipDataServerResponse =
    await getMembershipDataForCurrentUser(fetchWithAccessToken(accessToken))
  if (userMembershipDataServerResponse.ErrorCode !== 1) {
    return null
  }
  return createDestinyMembershipDetailsFromResponse(
    userMembershipDataServerResponse.Response,
  )
}

export async function getAccessTokenFromRefreshToken(refreshToken: string) {
  const body = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
  })

  const response = await axios(
    'https://www.bungie.net/platform/app/oauth/token/',
    {
      method: 'POST',
      data: body,
      headers: {
        Authorization: `Basic ${Buffer.from(
          `${process.env.OAUTH_ID}:${process.env.OAUTH_SECRET}`,
        ).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    },
  )
    .then((response) => {
      logger.info(`Access from refresh status: ${response.status}`)
      return response.data
    })
    .then(createTokensFromResponse)

  return response
}
