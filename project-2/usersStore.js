import fs from "fs"
import crypto from "crypto"

let users = []
let sessions = {}

const loadUsers = () => {
	try {
		const data = fs.readFileSync("./users.json", "utf8")
		users = JSON.parse(data)
	} catch (err) {
		console.log("Could not read users.json, starting with empty list")
	}
}

const saveUsers = () => {
	fs.writeFileSync("./users.json", JSON.stringify(users, null, 2))
}

const loadSessions = () => {
  try {
    const raw = fs.readFileSync("./sessions.json", "utf8")
    const data = JSON.parse(raw)

    Object.keys(sessions).forEach(key => delete sessions[key])
    Object.assign(sessions, data)

  } catch (err) {
    console.log("Could not read sessions.json, starting empty")
    Object.keys(sessions).forEach(key => delete sessions[key])
  }
}

const saveSessions = () => {
  fs.writeFileSync("./sessions.json", JSON.stringify(sessions, null, 2));
}

const createToken = () => {
  return Math.random().toString(36).slice(2) + Date.now();
}

const generateResetToken = () => {
  return crypto.randomBytes(32).toString("hex")
}

loadUsers()
loadSessions()

export { users, saveUsers, sessions, loadSessions, saveSessions, createToken, generateResetToken }