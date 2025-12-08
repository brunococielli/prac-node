import express from "express"
import path from "path"
import { fileURLToPath } from "url"
import { users, saveUsers } from "./usersStore.js"
import "dotenv/config"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const app = express()

app.use(express.json())
app.use(express.static("public"))

app.post("/register", (req, res) => {
	const { email, password } = req.body

	if (!email || !password) 
		return res.status(400).send("missing email or password")

	const exists = users.find((user) => {
		return user.email === email
	})

	if (exists) 
		return res.status(409).send("this email is alread signed in")

	const newUser = {
		id: Date.now(),
		email,
		password
	}

	users.push(newUser)

	saveUsers()

	res.send("User created successfully")
})

app.post("/login", (req, res) => {
	const { email, password } = req.body

	if (!email || !password)
		return res.status(400).send("missing email or password")

	const account = users.find((user) => {
		return user.email === email && user.password === password
	})

	if (account) return res.status(200).send("user found")
	else return res.status(400).send("email or password incorrect")
})

app.post("/send-email", async (req, res) => {
	const { email } = req.body

	try {
		const response = await resend.emails.send({
			from: "Acme <onboarding@resend.dev>",
			to: email,
			subject: "Welcome!",
			html: "<p>Your account was created successfully!</p>"
		})

		res.status(200).json({ ok: true, response })
	}	catch (err) {
		console.error(err)
    res.status(500).json({ ok: false, error: err.message })
	}
})

app.post("/forgot-password", async (req, res) => {
	const { email } = req.body

	const user = users.find(user => user.email === email)

	if (!user) return res.status(404).send("User doesn't exist")

	try {
		const response = await resend.emails.send({
			from: "Acme <onboarding@resend.dev>",
			to: email,
			subject: "We got you!",
			html: `<p>Your password is: ${user.password} </p>`
		})

		res.status(200).json({ ok: true })
	}	catch (err) {
		console.error(err)
    res.status(500).json({ ok: false, error: err.message })
	}
})

app.get("/users", (req, res) => {
	res.json(users)
})

app.get("/", (req, res) => {
	 res.sendFile(__dirname + "/public/html/index.html")
})

app.listen(3000, () => {
	console.log("server is listening in port 3000!")
})