import request from 'supertest'
import { app } from '../src/app.js'
import { findList } from '../src/service/list.service.js'
import { Session, connect, close, mockCreateSessionHandler } from './utils.js'

const bungieMembershipId = '1234567890'
const anotherBungieMembershipId = '0987654321'

const agent = request(app)

let mockSession: Session, anotherMockSession: Session

let listId: string | undefined, anotherListId: string | undefined

beforeAll(async () => {
  await connect()
  mockSession = await mockCreateSessionHandler(bungieMembershipId)
  expect(mockSession).toBeTruthy()
  listId = (await findList({ createdBy: mockSession?.userId, isPrivate: true }))
    ?.listId
  expect(listId).toBeTruthy()
  anotherMockSession = await mockCreateSessionHandler(
    anotherBungieMembershipId,
    true,
  )
  expect(anotherMockSession).toBeTruthy()
  anotherListId = (
    await findList({ createdBy: anotherMockSession?.userId, isPrivate: true })
  )?.listId
  expect(anotherListId).toBeTruthy()
})
// afterEach(async () => {
//   await clear()
// })
afterAll(async () => {
  await close()
})

describe('deserializeUser', () => {
  it('should not set user if access token is expired and refresh token is not provided', async () => {
    app.get('/test', (req, res) => {
      if (res.locals.user) res.sendStatus(200)
      res.sendStatus(401)
    })
    const res = await agent
      .get('/test')
      .set('Authorization', `Bearer ${anotherMockSession?.accessToken}`)
      .set('x-bungie-tokens', JSON.stringify(anotherMockSession?.bungieTokens))
    expect(res.status).toBe(401)
  })
})
