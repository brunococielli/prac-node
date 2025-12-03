import express from "express"
import fs from "fs"
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express()

app.use(express.json())
app.use(express.static("public"))

let users = []

try {
	const data = fs.readFileSync("./users.json", "utf8")
	users = JSON.parse(data)
} catch (err) {
	console.log("Could not read users.json, starting with empty list")
}

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

	fs.writeFileSync("./users.json", JSON.stringify(users, null, 2))

	res.send("User created successfully")
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