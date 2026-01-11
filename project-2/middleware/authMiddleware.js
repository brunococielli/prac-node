import prisma from "../db.js"
import { sessions } from "../sessions.js"

export const authMiddleware = async (req, res, next) => {
  const token = req.headers.authorization

  if (!token) {
    return res.status(401).json({ error: "No token" })
  }

  const email = sessions[token]
  if (!email) {
    return res.status(401).json({ error: "Invalid token" })
  }

  const user = await prisma.user.findUnique({
    where: { email },
  })

  if (!user) {
    return res.status(401).json({ error: "User not found" })
  }

  req.user = user
  next()
}