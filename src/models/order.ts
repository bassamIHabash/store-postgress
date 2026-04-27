import client from '../database'

export type Order = {
  id?:     number
  user_id: number
  status:  'active' | 'complete'
}

export type OrderProduct = {
  id?:        number
  order_id:   number
  product_id: number
  quantity:   number
}

export class OrderStore {
  /** GET /orders/current/:userId — current (active) order for a user */
  async currentByUser(userId: number): Promise<Order & { products: OrderProduct[] }> {
    const conn = await client.connect()

    const orderResult = await conn.query(
      `SELECT * FROM orders
       WHERE user_id = $1 AND status = 'active'
       ORDER BY id DESC
       LIMIT 1`,
      [userId]
    )
    const order: Order = orderResult.rows[0]

    if (!order || !order.id) {
      conn.release()
      return { ...order, products: [] }
    }

    const productsResult = await conn.query(
      'SELECT * FROM order_products WHERE order_id = $1',
      [order.id]
    )
    conn.release()

    return { ...order, products: productsResult.rows }
  }

  /** GET /orders/completed/:userId — all completed orders for a user */
  async completedByUser(userId: number): Promise<Order[]> {
    const conn   = await client.connect()
    const result = await conn.query(
      `SELECT * FROM orders
       WHERE user_id = $1 AND status = 'complete'`,
      [userId]
    )
    conn.release()
    return result.rows
  }

  /** POST /orders — create a new order */
  async create(o: Order): Promise<Order> {
    const conn   = await client.connect()
    const result = await conn.query(
      `INSERT INTO orders (user_id, status)
       VALUES ($1, $2)
       RETURNING *`,
      [o.user_id, o.status]
    )
    conn.release()
    return result.rows[0]
  }

  /** POST /orders/:orderId/products — add a product to an order */
  async addProduct(op: OrderProduct): Promise<OrderProduct> {
    const conn   = await client.connect()
    const result = await conn.query(
      `INSERT INTO order_products (order_id, product_id, quantity)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [op.order_id, op.product_id, op.quantity]
    )
    conn.release()
    return result.rows[0]
  }
}
