import express from "express"
import path from "path"
import { fileURLToPath } from "url"
import { 
	users,
	saveUsers,
	sessions,
	loadSessions,
	saveSessions, 
	createToken,
	generateResetToken
} from "./usersStore.js"
import "dotenv/config"
import { Resend } from "resend"
import bcrypt from "bcrypt"
import crypto from "crypto"

const resend = new Resend(process.env.RESEND_API_KEY)
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const app = express()

app.use(express.json())
app.use(express.static("public"))

app.post("/register", async (req, res) => {
	const { email, password } = req.body

	if (!email || !password) 
		return res.status(400).send("missing email or password")

	const exists = users.find((user) => {
		return user.email === email
	})

	if (exists) 
		return res.status(409).send("this email is alread signed in")

	const hashedPassword = await bcrypt.hash(password, 10)

	const newUser = {
		id: Date.now(),
		email,
		password: hashedPassword
	}

	users.push(newUser)

	saveUsers()

	res.send("User created successfully")
})

app.post("/login", async (req, res) => {
	const { email, password } = req.body

	if (!email || !password)
		return res.status(400).send("missing email or password")

  const user = users.find(u => u.email === email)
  if (!user) return res.status(400).send("Invalid credentials")

  const match = await bcrypt.compare(password, user.password)
  if (!match) return res.status(400).send("Invalid credentials")

  const token = createToken()
  sessions[token] = email
  saveSessions()

  res.json({ token })
})

app.post("/send-email", async (req, res) => {
	const { email } = req.body

	try {
		const emailResponse = await resend.emails.send({
			from: "Ted <onboarding@resend.dev>",
			to: email,
			subject: "Welcome!",
			html: "<p>Your account was created successfully!</p>"
		})

		res.status(200).json({ ok: true })
	}	catch (err) {
		console.error(err)
    res.status(500).json({ ok: false, error: err.message })
	}
})

app.post("/forgot-password", async (req, res) => {
	const { email } = req.body

	const user = users.find(user => user.email === email)

	if (!user) return res.status(404).send("User doesn't exist")

	const resetToken = generateResetToken()

  user.resetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex")

  user.resetTokenExpires = Date.now() + 15 * 60 * 1000 

  saveUsers()

	const resetLink = `http://localhost:3000/reset-password?token=${resetToken}`

	try {
		const emailResponse = await resend.emails.send({
			from: "Ted <onboarding@resend.dev>",
			to: email,
			subject: "Reset your password!",
			html: `<a href="${resetLink}">Reset password link.</a>`
		})

		res.status(200).send("If email exists, reset link sent")
	}	catch (err) {
		console.error(err)
    res.status(500).json({ ok: false, error: err.message })
	}
})

app.post("/reset-password", async (req, res) => {
  const { token, newPassword } = req.body

  const hashedToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex")

  const user = users.find(u =>
    u.resetToken === hashedToken &&
    u.resetTokenExpires > Date.now()
  )

  if (!user) return res.status(400).send("Invalid or expired token")

  user.password = await bcrypt.hash(newPassword, 10)
  user.resetToken = null
  user.resetTokenExpires = null

  saveUsers()

  res.send("Password updated")
})

app.post("/logout", async (req, res) => {
	const token = req.headers.authorization

	if (!token) return res.status(401).send("No token")

	loadSessions()

	delete sessions[token]

	saveSessions()

  res.send("Logged out")
})

app.get("/users", (req, res) => {
	res.json(users)
})

app.get("/", (req, res) => {
	 res.sendFile(__dirname + "/public/html/index.html")
})

app.get("/check", (req, res) => {
  const token = req.headers.authorization

  if (!token) return res.status(401).send("No token")

	loadSessions()

  const email = sessions[token]

  if (!email) return res.status(401).send("Invalid token")

  res.status(200).send("OK")
})

app.get("/reset-password", (req, res) => {
  res.sendFile(
    path.join(__dirname, "public", "html", "reset-password.html")
  )
})

app.listen(3000, () => {
	console.log("server is listening in port 3000!")
})