import client from '../database'

export type Product = {
  id?:      number
  name:     string
  price:    number
  category?: string
}

export class ProductStore {
  /** GET /products — return all products */
  async index(): Promise<Product[]> {
    const conn   = await client.connect()
    const result = await conn.query('SELECT * FROM products')
    conn.release()
    return result.rows
  }

  /** GET /products/:id — return one product */
  async show(id: number): Promise<Product> {
    const conn   = await client.connect()
    const result = await conn.query(
      'SELECT * FROM products WHERE id = $1',
      [id]
    )
    conn.release()
    return result.rows[0]
  }

  /** POST /products — create a new product */
  async create(p: Product): Promise<Product> {
    const conn   = await client.connect()
    const result = await conn.query(
      `INSERT INTO products (name, price, category)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [p.name, p.price, p.category ?? null]
    )
    conn.release()
    return result.rows[0]
  }

  /** GET /products?category=x — products filtered by category */
  async byCategory(category: string): Promise<Product[]> {
    const conn   = await client.connect()
    const result = await conn.query(
      'SELECT * FROM products WHERE category = $1',
      [category]
    )
    conn.release()
    return result.rows
  }

  /** GET /products/top — top 5 most popular products by order quantity */
  async topFive(): Promise<Product[]> {
    const conn   = await client.connect()
    const result = await conn.query(
      `SELECT p.*, SUM(op.quantity) AS total_ordered
       FROM products p
       JOIN order_products op ON p.id = op.product_id
       GROUP BY p.id
       ORDER BY total_ordered DESC
       LIMIT 5`
    )
    conn.release()
    return result.rows
  }

  /** DELETE /products/:id — delete a product */
  async delete(id: number): Promise<Product> {
    const conn   = await client.connect()
    const result = await conn.query(
      'DELETE FROM products WHERE id = $1 RETURNING *',
      [id]
    )
    conn.release()
    return result.rows[0]
  }

  /** PUT /products/:id — update a product */
  async update(id: number, p: Product): Promise<Product> {
    const conn   = await client.connect()
    const result = await conn.query(
      `UPDATE products SET name = $1, price = $2, category = $3
       WHERE id = $4
       RETURNING *`,
      [p.name, p.price, p.category, id]
    )
    conn.release()
    return result.rows[0]
  }
}
