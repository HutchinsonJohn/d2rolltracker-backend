/* eslint-disable @typescript-eslint/no-non-null-assertion */
import request from 'supertest'
import { app } from '../src/app.js'
import { connect, clear, close, Session } from './utils.js'
import manifest from '../src/manifest'
import {
  ETERNAL_BLAZON_DEF,
  PLUG_SET_DEFS,
  TIMELINES_VERTEX_DEF,
} from './testDefs.js'
import { findRoll } from '../src/service/roll.service.js'
import _ from 'lodash'
import { mockCreateSessionHandler } from './utils.js'
import { findList } from '../src/service/list.service.js'

const bungieMembershipId = '1234567890'
const anotherBungieMembershipId = '0987654321'

const agent = request(app)

let mockSession: Session, anotherMockSession: Session

let listId: string | undefined, anotherListId: string | undefined

const validBody: {
  listId: string | undefined
  rollName: string
  weaponHash: number
  columns: Record<
    string,
    {
      hash: number
      index: number
    }[]
  >
} = {
  listId,
  rollName: 'Test Roll',
  weaponHash: ETERNAL_BLAZON_DEF.hash,
  columns: {
    '1': [
      {
        hash: 194952923,
        index: 0,
      },
    ],
  },
}

manifest.definitions = {
  DestinyInventoryItemDefinition: {
    [ETERNAL_BLAZON_DEF.hash]: ETERNAL_BLAZON_DEF,
    [TIMELINES_VERTEX_DEF.hash]: TIMELINES_VERTEX_DEF,
  },
  DestinyPlugSetDefinition: PLUG_SET_DEFS,
  DestinySandboxPerkDefinition: {},
  DestinySocketCategoryDefinition: {},
  DestinySocketTypeDefinition: {},
  DestinyStatGroupDefinition: {},
  DestinyStatDefinition: {},
  DestinyDamageTypeDefinition: {},
}
manifest.path = 'test'

async function createAndVerifyRoll() {
  const response = await agent
    .post('/rolls')
    .set('authorization', mockSession!.accessToken)
    .set('x-refresh-token', mockSession!.refreshToken)
    .set('x-bungie-tokens', JSON.stringify(mockSession!.bungieTokens))
    .send(validBody)
  expect(response.status).toBe(200)
  expect(response.body.rollId).toBeTruthy()
  expect(response.body.rollName).toBe(validBody.rollName)
  expect(response.body.weaponHash).toBe(validBody.weaponHash)
  expect(response.body.columns).toEqual(validBody.columns)
  const rollId = response.body.rollId
  await rollMatchesValidBody(rollId)
  return rollId
}

async function rollMatchesValidBody(rollId: string | undefined) {
  const roll = await findRoll({ rollId })
  expect(roll).toBeTruthy()
  expect(roll?.rollId).toBeTruthy()
  expect(roll?.rollName).toBe(validBody.rollName)
  expect(roll?.weaponHash).toBe(validBody.weaponHash)
  expect(roll?.columns).toEqual(validBody.columns)
}

beforeAll(async () => {
  await connect()
})
beforeEach(async () => {
  mockSession = await mockCreateSessionHandler(bungieMembershipId)
  expect(mockSession).toBeTruthy()
  listId = (await findList({ createdBy: mockSession?.userId, isPrivate: true }))
    ?.listId
  validBody.listId = listId
  expect(listId).toBeTruthy()
  anotherMockSession = await mockCreateSessionHandler(anotherBungieMembershipId)
  expect(anotherMockSession).toBeTruthy()
  anotherListId = (
    await findList({ createdBy: anotherMockSession?.userId, isPrivate: true })
  )?.listId
  expect(anotherListId).toBeTruthy()
})
afterEach(async () => {
  await clear()
})
afterAll(async () => {
  await close()
})

describe('roll', () => {
  describe('should not create a roll', () => {
    it('if the user is not logged in', async () => {
      const response = await agent.post('/rolls').send(validBody)
      expect(response.status).toBeGreaterThanOrEqual(400)
      expect(await findRoll({})).toBeFalsy()
    })
    it('if there is a missing parameter', async () => {
      for (const key of Object.keys(validBody)) {
        const bodyCopy = { ...validBody }
        delete bodyCopy[key as keyof typeof validBody]
        const response = await agent
          .post('/rolls')
          .set('authorization', mockSession!.accessToken)
          .set('x-refresh-token', mockSession!.refreshToken)
          .set('x-bungie-tokens', JSON.stringify(mockSession!.bungieTokens))
          .send(bodyCopy)
        expect(response.status).toBeGreaterThanOrEqual(400)
        expect(await findRoll({})).toBeFalsy()
      }
    })
    const invalidListIds = [anotherListId, '123456789012']
    for (const invalidListId of invalidListIds) {
      it(`if listId is invalid listId: ${invalidListId}`, async () => {
        const body = _.cloneDeep(validBody)
        body.listId = invalidListId
        const response = await agent
          .post('/rolls')
          .set('authorization', mockSession!.accessToken)
          .set('x-refresh-token', mockSession!.refreshToken)
          .set('x-bungie-tokens', JSON.stringify(mockSession!.bungieTokens))
          .send(body)
        expect(response.status).toBeGreaterThanOrEqual(400)
        expect(await findRoll({})).toBeFalsy()
      })
    }
    const invalidRollNames = ['', 'a'.repeat(101), 'bitch', 'a', '    ']
    for (const invalidRollName of invalidRollNames) {
      it(`if rollName is invalid rollName: "${invalidRollName}"`, async () => {
        const body = _.cloneDeep(validBody)
        body.rollName = invalidRollName
        const response = await agent
          .post('/rolls')
          .set('authorization', mockSession!.accessToken)
          .set('x-refresh-token', mockSession!.refreshToken)
          .set('x-bungie-tokens', JSON.stringify(mockSession!.bungieTokens))
          .send(body)
        expect(response.status).toBeGreaterThanOrEqual(400)
        expect(await findRoll({})).toBeFalsy()
      })
    }
    it('if the weaponHash does not exist', async () => {
      const body = _.cloneDeep(validBody)
      body.weaponHash = 1234
      const response = await agent
        .post('/rolls')
        .set('authorization', mockSession!.accessToken)
        .set('x-refresh-token', mockSession!.refreshToken)
        .set('x-bungie-tokens', JSON.stringify(mockSession!.bungieTokens))
        .send(body)
      expect(response.status).toBeGreaterThanOrEqual(400)
      expect(await findRoll({})).toBeFalsy()
    })
    it('if there is a column does not exist on the weapon', async () => {
      const body = _.cloneDeep(validBody)
      body.columns = {
        '123': [
          {
            hash: 194952923,
            index: 0,
          },
        ],
      }
      const response = await agent
        .post('/rolls')
        .set('authorization', mockSession!.accessToken)
        .set('x-refresh-token', mockSession!.refreshToken)
        .set('x-bungie-tokens', JSON.stringify(mockSession!.bungieTokens))
        .send(body)
      expect(response.status).toBeGreaterThanOrEqual(400)
      expect(await findRoll({})).toBeFalsy()
    })
    it('if there is a perk hash that does not exist on the weapon', async () => {
      const body = _.cloneDeep(validBody)
      body.columns = {
        '1': [
          {
            hash: 1234,
            index: 0,
          },
        ],
      }
      const response = await agent
        .post('/rolls')
        .set('authorization', mockSession!.accessToken)
        .set('x-refresh-token', mockSession!.refreshToken)
        .set('x-bungie-tokens', JSON.stringify(mockSession!.bungieTokens))
        .send(body)
      expect(response.status).toBeGreaterThanOrEqual(400)
      expect(await findRoll({})).toBeFalsy()
    })
    const invalidIndexes = [-1, 128]
    for (const invalidIndex of invalidIndexes) {
      it(`if index is invalid index: ${invalidIndex}`, async () => {
        const body = _.cloneDeep(validBody)
        body.columns = {
          '1': [
            {
              hash: 194952923,
              index: invalidIndex,
            },
          ],
        }
        const response = await agent
          .post('/rolls')
          .set('authorization', mockSession!.accessToken)
          .set('x-refresh-token', mockSession!.refreshToken)
          .set('x-bungie-tokens', JSON.stringify(mockSession!.bungieTokens))
          .send(body)
        expect(response.status).toBeGreaterThanOrEqual(400)
        expect(await findRoll({})).toBeFalsy()
      })
    }
  })
  it('should create a roll', async () => {
    await createAndVerifyRoll()
  })
  describe('should not update roll', () => {
    let rollId: string | undefined
    beforeEach(async () => {
      rollId = await createAndVerifyRoll()
    })
    it('with a missing parameter', async () => {
      for (const key of Object.keys(validBody)) {
        const bodyCopy = { ...validBody }
        delete bodyCopy[key as keyof typeof validBody]
        const response = await agent
          .put(`/rolls/${rollId}`)
          .set('authorization', mockSession!.accessToken)
          .set('x-refresh-token', mockSession!.refreshToken)
          .set('x-bungie-tokens', JSON.stringify(mockSession!.bungieTokens))
          .send(bodyCopy)
        expect(response.status).toBeGreaterThanOrEqual(400)
        await rollMatchesValidBody(rollId)
      }
    })
    it('if the roll does not exist', async () => {
      const response = await agent
        .put(`/rolls/${'123456789012'}`)
        .set('authorization', mockSession!.accessToken)
        .set('x-refresh-token', mockSession!.refreshToken)
        .set('x-bungie-tokens', JSON.stringify(mockSession!.bungieTokens))
        .send(validBody)
      expect(response.status).toBeGreaterThanOrEqual(400)
      await rollMatchesValidBody(rollId)
    })
    it('if the user does not own the roll', async () => {
      const anotherResponse = await agent
        .post('/rolls')
        .set('authorization', anotherMockSession!.accessToken)
        .set('x-refresh-token', anotherMockSession!.refreshToken)
        .set(
          'x-bungie-tokens',
          JSON.stringify(anotherMockSession!.bungieTokens),
        )
        .send(validBody)
      const response = await agent
        .put(`/rolls/${anotherResponse.body.rollId}`)
        .set('authorization', mockSession!.accessToken)
        .set('x-refresh-token', mockSession!.refreshToken)
        .set('x-bungie-tokens', JSON.stringify(mockSession!.bungieTokens))
        .send(validBody)
      expect(response.status).toBeGreaterThanOrEqual(400)
      await rollMatchesValidBody(rollId)
    })
    it('if the new listId does not belong to the user', async () => {
      const body = _.cloneDeep(validBody)
      body.listId = anotherListId
      const response = await agent
        .put(`/rolls/${rollId}`)
        .set('authorization', mockSession!.accessToken)
        .set('x-refresh-token', mockSession!.refreshToken)
        .set('x-bungie-tokens', JSON.stringify(mockSession!.bungieTokens))
        .send(body)
      expect(response.status).toBeGreaterThanOrEqual(400)
      await rollMatchesValidBody(rollId)
    })
    it('if the weaponHash is different', async () => {
      const body = _.cloneDeep(validBody)
      body.weaponHash = TIMELINES_VERTEX_DEF.hash
      const response = await agent
        .put(`/rolls/${rollId}`)
        .set('authorization', mockSession!.accessToken)
        .set('x-refresh-token', mockSession!.refreshToken)
        .set('x-bungie-tokens', JSON.stringify(mockSession!.bungieTokens))
        .send(body)
      expect(response.status).toBeGreaterThanOrEqual(400)
      await rollMatchesValidBody(rollId)
    })
  })
  it('should update the roll', async () => {
    const rollId = await createAndVerifyRoll()
    const newRollName = 'Test Roll New Name'
    const body = {
      listId,
      rollName: newRollName,
      weaponHash: ETERNAL_BLAZON_DEF.hash,
      columns: {
        '1': [
          {
            hash: 194952923,
            index: 0,
          },
        ],
        '2': [
          {
            hash: 2420895100,
            index: 127,
          },
        ],
      },
    }
    const response = await agent
      .put(`/rolls/${rollId}`)
      .set('authorization', mockSession!.accessToken)
      .set('x-refresh-token', mockSession!.refreshToken)
      .set('x-bungie-tokens', JSON.stringify(mockSession!.bungieTokens))
      .send(body)
    expect(response.status).toBe(200)
    expect(response.body.rollName).toBe(newRollName)
    expect(response.body.columns).toEqual(body.columns)
  })
  describe('should not delete a roll', () => {
    beforeEach(async () => {
      await createAndVerifyRoll()
    })
    it('if it does not exist', async () => {
      const response = await agent
        .delete(`/rolls/${'123456789012'}`)
        .set('authorization', mockSession!.accessToken)
        .set('x-refresh-token', mockSession!.refreshToken)
        .set('x-bungie-tokens', mockSession!.accessToken)
      expect(response.status).toBeGreaterThanOrEqual(400)
    })
    it('if the user did not create it', async () => {
      const anotherResponse = await agent
        .post('/rolls')
        .set('authorization', anotherMockSession!.accessToken)
        .set('x-refresh-token', anotherMockSession!.refreshToken)
        .set(
          'x-bungie-tokens',
          JSON.stringify(anotherMockSession!.bungieTokens),
        )
        .send(validBody)
      const anotherRollId = anotherResponse.body.rollId
      const response = await agent
        .delete(`/rolls/${anotherRollId}`)
        .set('authorization', mockSession!.accessToken)
        .set('x-refresh-token', mockSession!.refreshToken)
        .set('x-bungie-tokens', JSON.stringify(mockSession!.bungieTokens))
      expect(response.status).toBeGreaterThanOrEqual(400)
    })
  })
  it('should delete the roll', async () => {
    const rollId = await createAndVerifyRoll()
    const response = await agent
      .delete(`/rolls/${rollId}`)
      .set('authorization', mockSession!.accessToken)
      .set('x-refresh-token', mockSession!.refreshToken)
      .set('x-bungie-tokens', JSON.stringify(mockSession!.bungieTokens))
    expect(response.status).toBe(200)
    expect(await findRoll({ rollId })).toBeFalsy()
    expect((await findList({ listId }))?.rolls).toHaveLength(0)
  })
})

describe('delete user', () => {
  it('should delete user and associated rolls and lists', async () => {
    await createAndVerifyRoll()
    const response = await agent
      .delete('/users')
      .set('authorization', mockSession!.accessToken)
      .set('x-refresh-token', mockSession!.refreshToken)
      .set('x-bungie-tokens', JSON.stringify(mockSession!.bungieTokens))
    expect(response.status).toBe(200)
    expect(await findList({ listId })).toBeFalsy()
    expect(await findRoll({})).toBeFalsy()
  })
  it('should delete user and associated rolls and lists even if user has no rolls', async () => {
    const response = await agent
      .delete('/users')
      .set('authorization', mockSession!.accessToken)
      .set('x-refresh-token', mockSession!.refreshToken)
      .set('x-bungie-tokens', JSON.stringify(mockSession!.bungieTokens))
    expect(response.status).toBe(200)
    expect(await findList({ listId })).toBeFalsy()
    expect(await findRoll({})).toBeFalsy()
  })
  it('should not delete user if user is not logged in', async () => {
    const response = await agent.delete('/users')
    expect(response.status).toBeGreaterThanOrEqual(400)
  })
})
