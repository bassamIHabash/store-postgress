import supertest from 'supertest'
import app from '../../server'
import jwt from 'jsonwebtoken'

const request = supertest(app)
const token = jwt.sign({ user: { id: 1, first_name: 'test' } }, process.env.TOKEN_SECRET as string)

describe('Product Handler', () => {
  beforeAll(async () => {
    await request
      .post('/products')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Initial Product',
        price: 10
      })
  })

  it('GET /products should return 200', async () => {
    const response = await request.get('/products')
    expect(response.status).toBe(200)
  })

  it('GET /products/:id should return 200', async () => {
    const products = await request.get('/products')
    const id = products.body[0].id
    const response = await request.get(`/products/${id}`)
    expect(response.status).toBe(200)
  })

  it('POST /products should return 401 without token', async () => {
    const response = await request.post('/products').send({
      name: 'Handler Product',
      price: 20
    })
    expect(response.status).toBe(401)
  })

  it('POST /products should return 201 with token', async () => {
    const response = await request
      .post('/products')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Handler Product',
        price: 20
      })
    expect(response.status).toBe(201)
  })
})
