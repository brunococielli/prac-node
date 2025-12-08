import { goLogInPage } from "./utils.js" 

const emailInp = document.getElementById("email")
const sendBtn = document.getElementById("sendBtn")

document.addEventListener("DOMContentLoaded", () => {
    const backBtn = document.getElementById("backBtn")
		
		backBtn.addEventListener("click", goLogInPage)
})

const sendPassword = async () => {
	const email = emailInp.value

	emailInp.value = ""

	const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
	if (!isValidEmail.test(email)) return alert("Invalid email address!")

	try {
		const res = await fetch("/forgot-password", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ email })
		})

		if (!res.ok) {
			const errorText = await res.text()
			return alert(errorText)
		}

		alert("Email sent!")

	} catch (err) {
		console.error(err)
		alert("Network error or server offline")
	}
}

sendBtn.addEventListener("click", sendPassword)