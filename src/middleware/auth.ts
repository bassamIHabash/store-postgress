import jwt from 'jsonwebtoken'
import { Request, Response, NextFunction } from 'express'

export function verifyToken(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers['authorization']
  if (!authHeader) {
    res.status(401).json({ error: 'No token provided' })
    return
  }

  // Expected format: "Bearer <token>"
  const token = authHeader.split(' ')[1]
  try {
    jwt.verify(token, process.env.TOKEN_SECRET as string)
    next()
  } catch {
    res.status(403).json({ error: 'Invalid or expired token' })
  }
}
