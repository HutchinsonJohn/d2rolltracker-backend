import request from 'supertest'
import { app } from '../src/app.js'

const agent = request(app)

describe('healthcheck', () => {
  it('should return 200', async () => {
    const response = await agent.get('/healthcheck')
    expect(response.status).toBe(200)
  })
})
