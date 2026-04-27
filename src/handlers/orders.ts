import { Request, Response, Router } from 'express'
import { OrderStore }                from '../models/order'
import { verifyToken }               from '../middleware/auth'

const store  = new OrderStore()
const router = Router()

// GET /orders/current/:userId  [token required]
router.get('/current/:userId', verifyToken, async (req: Request, res: Response) => {
  try {
    const order = await store.currentByUser(parseInt(req.params.userId))
    if (!order) return res.status(404).json({ error: 'No active order found' })
    res.json(order)
  } catch (err) {
    res.status(500).json({ error: (err as Error).message })
  }
})

// GET /orders/completed/:userId  [token required]
router.get('/completed/:userId', verifyToken, async (req: Request, res: Response) => {
  try {
    res.json(await store.completedByUser(parseInt(req.params.userId)))
  } catch (err) {
    res.status(500).json({ error: (err as Error).message })
  }
})

// POST /orders  [token required]
router.post('/', verifyToken, async (req: Request, res: Response) => {
  try {
    const { user_id, status } = req.body
    if (!user_id || !status) {
      return res.status(400).json({ error: 'user_id and status are required' })
    }
    res.status(201).json(await store.create({ user_id, status }))
  } catch (err) {
    res.status(500).json({ error: (err as Error).message })
  }
})

// POST /orders/:orderId/products  [token required]
router.post('/:orderId/products', verifyToken, async (req: Request, res: Response) => {
  try {
    const { product_id, quantity } = req.body
    if (!product_id || !quantity) {
      return res.status(400).json({ error: 'product_id and quantity are required' })
    }
    res.status(201).json(await store.addProduct({
      order_id:   parseInt(req.params.orderId),
      product_id,
      quantity,
    }))
  } catch (err) {
    res.status(500).json({ error: (err as Error).message })
  }
})

export default router
