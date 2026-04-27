import { Request, Response, Router } from 'express'
import jwt                           from 'jsonwebtoken'
import { UserStore }                 from '../models/user'
import { verifyToken }               from '../middleware/auth'

const store  = new UserStore()
const router = Router()

// POST /users/signup — create account & return JWT
router.post('/signup', async (req: Request, res: Response) => {
  try {
    const { first_name, last_name, password } = req.body
    if (!first_name || !last_name || !password) {
      return res.status(400).json({ error: 'first_name, last_name, and password are required' })
    }
    const user  = await store.create({ first_name, last_name, password })
    const token = jwt.sign({ user }, process.env.TOKEN_SECRET as string)
    res.status(201).json({ user, token })
  } catch (err) {
    res.status(500).json({ error: (err as Error).message })
  }
})

// POST /users/signin — authenticate & return JWT
router.post('/signin', async (req: Request, res: Response) => {
  try {
    const { first_name, password } = req.body
    if (!first_name || !password) {
      return res.status(400).json({ error: 'first_name and password are required' })
    }
    const user = await store.authenticate(first_name, password)
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }
    const token = jwt.sign({ user }, process.env.TOKEN_SECRET as string)
    res.json({ user, token })
  } catch (err) {
    res.status(500).json({ error: (err as Error).message })
  }
})

// GET /users  [token required]
router.get('/', verifyToken, async (_req: Request, res: Response) => {
  try {
    res.json(await store.index())
  } catch (err) {
    res.status(500).json({ error: (err as Error).message })
  }
})

// GET /users/:id  [token required]
router.get('/:id', verifyToken, async (req: Request, res: Response) => {
  try {
    const user = await store.show(parseInt(req.params.id))
    if (!user) return res.status(404).json({ error: 'User not found' })
    res.json(user)
  } catch (err) {
    res.status(500).json({ error: (err as Error).message })
  }
})

export default router
