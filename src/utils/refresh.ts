import { reissueAccessToken } from '../service/session.service.js'
import { getAccessTokenFromRefreshToken } from './bungie.js'

export default async function getFreshTokensFromRefreshTokens(
  refreshToken: string,
  bungieRefreshToken?: string,
) {
  let newBungieTokens
  if (bungieRefreshToken) {
    try {
      newBungieTokens = await getAccessTokenFromRefreshToken(bungieRefreshToken)
    } catch (error) {
      newBungieTokens = undefined
    }
  }

  const newTokens = await reissueAccessToken(
    refreshToken,
    newBungieTokens?.accessToken.expiresIn,
    newBungieTokens?.refreshToken.expiresIn,
  )

  return {
    newTokens,
    newBungieTokens,
  }
}
