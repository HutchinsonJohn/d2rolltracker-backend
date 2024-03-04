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

// Keys are embedded in the code due to a limit on the total size of environment variables in AWS
const ACCESS_TOKEN_PUBLIC_KEY =
  process.env.NODE_ENV === 'test'
    ? process.env.ACCESS_TOKEN_PUBLIC_KEY || ''
    : `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA0etfCGjWUNX0SmGK1ycv
euA1ukKqv2bDmaetEKI642OH2jgrkDVlEuWjCTrT8yduAAxmbgqKQXlhQkoR84bf
Jw2XhAmulaZoj73qSQj4Z9kob4qDhjtanVE8lEB/0XvP1TEPtEkwejq9ZA2IiFOL
JZ6/sBWEbRnn1J4yoxYu3XwUTyQqXH3UJPd+j/ke0EBWrXa3hr7Orey6kkLCvq6H
cRz+C6PQmAuf4stzESLsq/euXlvyvcJ3ySR5o7UM2luoWJk1xxzXOkD4R1LoE+he
z2g98mD2ByjX0ARuT9aUNv1JFrKStX1wulViufImOxPeSWdmb/eWsgwV7IGN6wHO
BwIDAQAB
-----END PUBLIC KEY-----`

const REFRESH_TOKEN_PUBLIC_KEY =
  process.env.NODE_ENV === 'test'
    ? process.env.REFRESH_TOKEN_PUBLIC_KEY || ''
    : `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAwCXnT5nnZuZIOHyToC5p
xDbcdSWDNgsMyph5EiuWy5jRcixMoaDqEtzYOa9GjGJi95Z5bXOlFABYSW4lSt1w
2xrWgrqlU2iU6Imuws0YPu07+W0Z68tS/lBF7nni9b3ZDMhLKGL97bj7GPkxIy6/
6w+RPWXykKNyjO5+4OQcG/MZD5XDngvaGokNZx52gGILFtWHU+WFCuy4jfQcOo30
8IsOpmQWF04stkmn2r68i4MwfqT3vU13KHg2a/8BR2eXeLVTEUc5ILc5ABPKaK8Y
9S4CBKPjC+Vjsbs6qUU4ZIhqAX+/WX017ORp+4EY2g138x6U/XVZJcqoQkQ4Qlpl
SwIDAQAB
-----END PUBLIC KEY-----`

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
