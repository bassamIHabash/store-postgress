import supertest from 'supertest'
import app from '../../server'
import jwt from 'jsonwebtoken'

const request = supertest(app)
const token = jwt.sign({ user: { id: 1, first_name: 'test' } }, process.env.TOKEN_SECRET as string)

describe('User Handler', () => {
  it('POST /users/signup should return 201 and token', async () => {
    const response = await request.post('/users/signup').send({
      first_name: 'Handler',
      last_name: 'User',
      password: 'password'
    })
    expect(response.status).toBe(201)
    expect(response.body.token).toBeDefined()
  })

  it('POST /users/signin should return 200 and token', async () => {
    const response = await request.post('/users/signin').send({
      first_name: 'Handler',
      password: 'password'
    })
    expect(response.status).toBe(200)
    expect(response.body.token).toBeDefined()
  })

  it('GET /users should return 401 without token', async () => {
    const response = await request.get('/users')
    expect(response.status).toBe(401)
  })

  it('GET /users should return 200 with token', async () => {
    const response = await request
      .get('/users')
      .set('Authorization', `Bearer ${token}`)
    expect(response.status).toBe(200)
  })
})
