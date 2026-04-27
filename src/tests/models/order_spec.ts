import { OrderStore, Order } from '../../models/order'
import { UserStore } from '../../models/user'
import { ProductStore } from '../../models/product'

const store = new OrderStore()
const userStore = new UserStore()
const productStore = new ProductStore()

describe('Order Model', () => {
  let userId: number
  let productId: number
  let orderId: number

  beforeAll(async () => {
    const user = await userStore.create({
      first_name: 'Order',
      last_name: 'Test',
      password: 'password'
    })
    userId = user.id!

    const product = await productStore.create({
      name: 'Order Product',
      price: 50
    })
    productId = product.id!
  })

  it('should have a create method', () => {
    expect(store.create).toBeDefined()
  })

  it('create method should add an order', async () => {
    const result = await store.create({
      user_id: userId,
      status: 'active'
    })
    orderId = result.id!
    expect(result.user_id).toEqual(userId)
    expect(result.status).toEqual('active')
  })

  it('addProduct method should add product to order', async () => {
    const result = await store.addProduct({
      order_id: orderId,
      product_id: productId,
      quantity: 2
    })
    expect(result.order_id).toEqual(orderId)
    expect(result.product_id).toEqual(productId)
    expect(result.quantity).toEqual(2)
  })

  it('currentByUser method should return active order', async () => {
    const result = await store.currentByUser(userId)
    expect(result.id).toEqual(orderId)
    expect(result.products.length).toBeGreaterThan(0)
  })
})
