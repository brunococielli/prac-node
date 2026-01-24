import express from "express"
import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"
import "dotenv/config"
import { Resend } from "resend"
import bcrypt from "bcrypt"
import crypto from "crypto"
import prisma from "./project-2/db.js"
import { upload } from "./project-2/upload.js"
import { authMiddleware } from "./project-2/middleware/authMiddleware.js"
import { sessions } from "./project-2/sessions.js"

const resend = new Resend(process.env.RESEND_API_KEY)

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const app = express()

app.use(express.json())
app.use("/", express.static(path.join(__dirname, "portfolio")))
app.use("/project-2", express.static(path.join(__dirname, "project-2", "public")))
app.use("/project-2/uploads", express.static(path.join(__dirname, "project-2", "uploads")))

const createToken = () =>
  Math.random().toString(36).slice(2) + Date.now()

const generateResetToken = () =>
  crypto.randomBytes(32).toString("hex")

app.post("/register", async (req, res) => {
  const { email, password } = req.body

  if (!email || !password)
    return res.status(400).send("missing email or password")

  const exists = await prisma.user.findUnique({
    where: { email }
  })

  if (exists)
    return res.status(409).send("this email is alread signed in")

  const hashedPassword = await bcrypt.hash(password, 10)

  await prisma.user.create({
    data: {
      email,
      password: hashedPassword
    }
  })

  res.send("User created successfully")
})

app.post("/send-email", async (req, res) => {
  const { email } = req.body

  try {
    await resend.emails.send({
      from: "Ted <onboarding@resend.dev>",
      to: email,
      subject: "Welcome!",
      html: "<p>Your account was created successfully!</p>"
    })

    res.send("Email sent")
  } catch (err) {
    console.error(err)
    res.status(500).send("Failed to send email")
  }
})

app.post("/login", async (req, res) => {
  const { email, password } = req.body

  if (!email || !password)
    return res.status(400).send("missing email or password")

  const user = await prisma.user.findUnique({
    where: { email }
  })

  if (!user) return res.status(400).send("Invalid credentials")

  const match = await bcrypt.compare(password, user.password)
  if (!match) return res.status(400).send("Invalid credentials")

  const token = createToken()
  sessions[token] = user.email

  res.json({ token })
})

app.post("/logout", (req, res) => {
  const token = req.headers.authorization
  if (!token) return res.status(401).send("No token")

  delete sessions[token]
  res.send("Logged out")
})

app.get("/check", (req, res) => {
  const token = req.headers.authorization
  if (!token) return res.status(401).send("No token")

  const email = sessions[token]
  if (!email) return res.status(401).send("Invalid token")

  res.send("OK")
})

app.post("/forgot-password", async (req, res) => {
  const { email } = req.body

  const user = await prisma.user.findUnique({
    where: { email }
  })

  if (!user) return res.status(404).send("User doesn't exist")

  const resetToken = generateResetToken()
  const hashedToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex")

  await prisma.user.update({
    where: { email },
    data: {
      resetToken: hashedToken,
      resetTokenExpires: new Date(Date.now() + 15 * 60 * 1000)
    }
  })

  const resetLink = `http://localhost:3000/project-2/reset-password.html?token=${resetToken}`

  try {
    await resend.emails.send({
      from: "Ted <onboarding@resend.dev>",
      to: email,
      subject: "Reset your password!",
      html: `<a href="${resetLink}">Reset password link.</a>`
    })

    res.send("If email exists, reset link sent")
  } catch (err) {
    console.error(err)
    res.status(500).send("Failed to send reset email")
  }
})

app.post("/reset-password", async (req, res) => {
  const { token, newPassword } = req.body

  const hashedToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex")

  const user = await prisma.user.findFirst({
    where: {
      resetToken: hashedToken,
      resetTokenExpires: {
        gt: new Date()
      }
    }
  })

  if (!user) return res.status(400).send("Invalid or expired token")

  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: await bcrypt.hash(newPassword, 10),
      resetToken: null,
      resetTokenExpires: null
    }
  })

  res.send("Password updated")
})

app.post("/upload", authMiddleware, upload.single("image"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" })
      }

      const userId = req.user.id

      const imagePath = `/project-2/uploads/${req.file.filename}`

      await prisma.user.update({
        where: { id: userId },
        data: {
          images: {
            push: imagePath,
          },
        },
      })

      res.json({
        message: "Image uploaded",
        image: imagePath,
      })
    } catch (err) {
      console.error(err)
      res.status(500).json({ error: "Upload failed" })
    }
  }
)

app.delete("/deleteImage", authMiddleware, async (req, res) => {
  try {
    const { src } = req.body
    const userId = req.user.id

    if (!src) {
      return res.status(400).json({ error: "Missing image src" })
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { images: true },
    })

    if (!user || !user.images.includes(src)) {
      return res.status(403).json({ error: "Not allowed" })
    }

    const uploadDir = path.join(process.cwd(), "project-2", "uploads")
    const filename = path.basename(src)
    const filePath = path.join(uploadDir, filename)

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath)
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        images: {
          set: user.images.filter(img => img !== src),
        },
      },
    })

    res.json({ message: "Image deleted" })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Delete failed" })
  }
})

app.get("/sendImages", authMiddleware, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { images: true },
    })

    res.json(user.images)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Failed to load images" })
  }
})

app.listen(3000, () => {
  console.log("server is listening in port 3000!")
})