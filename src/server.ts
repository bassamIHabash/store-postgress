import 'dotenv/config'
import express, { Request, Response } from 'express'
import bodyParser                     from 'body-parser'

import productRoutes from './handlers/products'
import userRoutes    from './handlers/users'
import orderRoutes   from './handlers/orders'

const app: express.Application = express()
const address                  = '0.0.0.0:3000'

app.use(bodyParser.json())

// ── Routes ─────────────────────────────────────────────────────────────────
app.use('/products', productRoutes)
app.use('/users',    userRoutes)
app.use('/orders',   orderRoutes)

app.get('/', (_req: Request, res: Response) => {
  res.json({ message: 'Storefront API is running 🚀' })
})

app.listen(3000, () => {
  console.log(`Server started on: ${address}`)
})

export default app
