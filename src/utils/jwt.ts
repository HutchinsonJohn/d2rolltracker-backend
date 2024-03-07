import jsonWebToken, { SignOptions } from 'jsonwebtoken'
const { sign, verify } = jsonWebToken

const ACCESS_TOKEN_PRIVATE_KEY = (
  process.env.ACCESS_TOKEN_PRIVATE_KEY || ''
).replace(/\\n/g, '\n')
const REFRESH_TOKEN_PRIVATE_KEY = (
  process.env.REFRESH_TOKEN_PRIVATE_KEY || ''
).replace(/\\n/g, '\n')

export function signJwt(
  object: object,
  keyName: 'ACCESS_TOKEN_PRIVATE_KEY' | 'REFRESH_TOKEN_PRIVATE_KEY',
  options?: SignOptions,
) {
  return sign(
    object,
    keyName === 'ACCESS_TOKEN_PRIVATE_KEY'
      ? ACCESS_TOKEN_PRIVATE_KEY
      : REFRESH_TOKEN_PRIVATE_KEY,
    {
      ...(options && options),
      algorithm: 'RS256',
    },
  )
}

const ACCESS_TOKEN_PUBLIC_KEY = (
  process.env.ACCESS_TOKEN_PUBLIC_KEY || ''
).replace(/\\n/g, '\n')
const REFRESH_TOKEN_PUBLIC_KEY = (
  process.env.REFRESH_TOKEN_PUBLIC_KEY || ''
).replace(/\\n/g, '\n')

export function verifyJwt(
  token: string,
  keyName: 'ACCESS_TOKEN_PUBLIC_KEY' | 'REFRESH_TOKEN_PUBLIC_KEY',
) {
  try {
    const decoded = verify(
      token,
      keyName === 'ACCESS_TOKEN_PUBLIC_KEY'
        ? ACCESS_TOKEN_PUBLIC_KEY
        : REFRESH_TOKEN_PUBLIC_KEY,
    )
    return {
      isValid: true,
      isExpired: false,
      decoded,
    }
  } catch (error) {
    if (error instanceof Error) {
      return {
        isValid: false,
        isExpired: error.message === 'jwt expired',
        decoded: null,
      }
    }
    return {
      isValid: false,
      isExpired: false,
      decoded: null,
    }
  }
}
