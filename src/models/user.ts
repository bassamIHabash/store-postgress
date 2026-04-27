import client from '../database'
import bcrypt from 'bcrypt'

export type User = {
  id?:        number
  first_name: string
  last_name:  string
  password:   string
}

const pepper     = process.env.BCRYPT_PASSWORD as string
const saltRounds = parseInt(process.env.SALT_ROUNDS as string)

export class UserStore {
  /** Return all users — password excluded */
  async index(): Promise<User[]> {
    const conn   = await client.connect()
    const result = await conn.query('SELECT id, first_name, last_name FROM users')
    conn.release()
    return result.rows
  }

  /** Return one user by id — password excluded */
  async show(id: number): Promise<User> {
    const conn   = await client.connect()
    const result = await conn.query(
      'SELECT id, first_name, last_name FROM users WHERE id = $1',
      [id]
    )
    conn.release()
    return result.rows[0]
  }

  /**
   * Sign-up: hash the password then insert.
   * Returns the created user (no password).
   */
  async create(u: User): Promise<User> {
    const hash = bcrypt.hashSync(u.password + pepper, saltRounds)

    const conn   = await client.connect()
    const result = await conn.query(
      `INSERT INTO users (first_name, last_name, password)
       VALUES ($1, $2, $3)
       RETURNING id, first_name, last_name`,
      [u.first_name, u.last_name, hash]
    )
    conn.release()
    return result.rows[0]
  }

  /**
   * Sign-in: compare provided password against stored hash.
   * Returns the user row on success, null on failure.
   */
  async authenticate(first_name: string, password: string): Promise<User | null> {
    const conn   = await client.connect()
    const result = await conn.query(
      'SELECT * FROM users WHERE first_name = $1',
      [first_name]
    )
    conn.release()

    if (!result.rows.length) return null

    const user = result.rows[0] as User & { password: string }
    const valid = bcrypt.compareSync(password + pepper, user.password)
    if (!valid) return null

    // Return without the hashed password
    const { password: _p, ...safe } = user
    return safe as User
  }
}
