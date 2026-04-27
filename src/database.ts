import { Pool } from 'pg'

const {
  POSTGRES_HOST,
  POSTGRES_DB,
  POSTGRES_TEST_DB,
  POSTGRES_USER,
  POSTGRES_PASSWORD,
  ENV,
} = process.env

const client = new Pool({
  host:     POSTGRES_HOST,
  database: ENV === 'test' ? POSTGRES_TEST_DB : POSTGRES_DB,
  user:     POSTGRES_USER,
  password: POSTGRES_PASSWORD,
})

export default client
