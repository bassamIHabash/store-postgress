import { Pool } from 'pg'

const client = new Pool({
  host:     process.env.POSTGRES_HOST     || '127.0.0.1',
  port:     parseInt(process.env.POSTGRES_PORT || '5432'),
  database: process.env.POSTGRES_DB       || 'storefront',
  user:     process.env.POSTGRES_USER     || 'postgres',
  password: process.env.POSTGRES_PASSWORD || 'password',
})

export default client
