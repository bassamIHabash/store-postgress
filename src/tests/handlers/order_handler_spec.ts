import supertest from 'supertest'
import app from '../../server'
import jwt from 'jsonwebtoken'
import { UserStore } from '../../models/user'
import { ProductStore } from '../../models/product'

const request = supertest(app)
const userStore = new UserStore()
const productStore = new ProductStore()

describe('Order Handler', () => {
  let token: string
  let userId: number
  let productId: number
  let orderId: number

  beforeAll(async () => {
    const user = await userStore.create({
      first_name: 'OrderHandler',
      last_name: 'User',
      password: 'password'
    })
    userId = user.id!
    token = jwt.sign({ user }, process.env.TOKEN_SECRET as string)

    const product = await productStore.create({
      name: 'OrderHandler Product',
      price: 15
    })
    productId = product.id!
  })

  it('POST /orders should return 201 with token', async () => {
    const response = await request
      .post('/orders')
      .set('Authorization', `Bearer ${token}`)
      .send({
        user_id: userId,
        status: 'active'
      })
    orderId = response.body.id
    expect(response.status).toBe(201)
  })

  it('GET /orders/current/:userId should return 200 with token', async () => {
    const response = await request
      .get(`/orders/current/${userId}`)
      .set('Authorization', `Bearer ${token}`)
    expect(response.status).toBe(200)
  })

  it('POST /orders/:orderId/products should return 201 with token', async () => {
    const response = await request
      .post(`/orders/${orderId}/products`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        product_id: productId,
        quantity: 5
      })
    expect(response.status).toBe(201)
  })
})
