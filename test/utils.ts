import { BungieMembershipType } from 'bungie-api-ts/common'
import { createList } from '../src/service/list.service.js'
import { createSession } from '../src/service/session.service.js'
import {
  findUser,
  createUser,
  updateUser,
} from '../src/service/user.service.js'
import { Tokens } from '../src/utils/bungie.js'
import { signJwt } from '../src/utils/jwt.js'

import mongoose, { Types } from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'

let mongoServer: MongoMemoryServer

export async function connect() {
  mongoServer = await MongoMemoryServer.create()
  mongoose.connect(mongoServer.getUri())
}

export async function close() {
  await mongoose.connection.dropDatabase()
  await mongoose.connection.close()
  await mongoServer.stop()
}

export async function clear() {
  const collections = mongoose.connection.collections
  for (const key in collections) {
    await collections[key].deleteMany({})
  }
}

export type Session =
  | {
      accessToken: string
      refreshToken: string
      bungieTokens: Tokens
      userId: Types.ObjectId
    }
  | undefined

export async function mockCreateSessionHandler(
  bungieMembershipId: string,
  expiredTokens = false,
) {
  const bungieTokens: Tokens = {
    accessToken: {
      token: '1234',
      type: 'access',
      expiresIn: 999999,
      createdAt: Date.now(),
    },
    refreshToken: {
      token: '5678',
      type: 'refresh',
      expiresIn: 999999,
      createdAt: Date.now(),
    },
    bungieMembershipId,
  }
  let user = await findUser({
    bungieMembershipId: bungieTokens.bungieMembershipId,
  })

  const destinyMembershipsDetails = {
    defaultDestinyMembershipType: BungieMembershipType.TigerXbox,
    defaultDestinyMembershipId: '9876543210',
    displayName: 'Test User',
    displayNameCode: 0,
    profilePicturePath: '',
    destinyMembershipsDetails: [
      {
        membershipType: BungieMembershipType.TigerXbox,
        membershipId: '9876543210',
        displayName: 'Test User',
        iconPath: '/img/theme/destiny/icons/icon_xbl.png',
        displayNameCode: 0,
      },
    ],
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
    expect(user).toBeTruthy()
    return
  }

  // create a session
  const session = await createSession(user._id, '')

  // create an access token
  const accessToken = signJwt(
    { ...user.toObject(), session: session },
    'ACCESS_TOKEN_PRIVATE_KEY',
    { expiresIn: expiredTokens ? -1000 : bungieTokens.accessToken.expiresIn },
  )

  // create a refresh token
  const refreshToken = signJwt(
    { ...user.toObject(), session: session },
    'REFRESH_TOKEN_PRIVATE_KEY',
    { expiresIn: expiredTokens ? -1000 : bungieTokens.refreshToken.expiresIn },
  )

  // return access and refresh tokens
  return {
    accessToken,
    refreshToken,
    bungieTokens,
    userId: user._id,
  }
}
