import { goBack } from "./utils.js"

const emailInp = document.getElementById("email")
const passwordInp = document.getElementById("password")
const registerBtn = document.getElementById("registerBtn")

document.addEventListener("DOMContentLoaded", () => {
    document.querySelector(".backBtn").addEventListener("click", goBack)
})

const createUser = async () => {
	const email = emailInp.value
	const password = passwordInp.value

	emailInp.value = ""
	passwordInp.value = ""

	try {
		const res = await fetch("/register", {
			method: "POST",
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify({
				email,
				password
			})
		})

		if (!res.ok) {
			const errorText = await res.text()
			alert(errorText)
			return
		}

		const data = await res.text()
		alert(data)

	} catch (err) {
		console.error(err)
		alert("Network error or server offline")
	}
}

registerBtn.addEventListener("click", createUser)