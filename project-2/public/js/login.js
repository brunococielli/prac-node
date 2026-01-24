import { goBack } from "./utils.js" 

const emailInp = document.getElementById("email")
const passwordInp = document.getElementById("password")
const logBtn = document.querySelector(".logBtn")
const forgotBtn = document.getElementById("forgotBtn")

document.addEventListener("DOMContentLoaded", () => {
    const backBtn = document.querySelector(".backBtn")
		
		backBtn.addEventListener("click", goBack)
})

const logUser = async () => {
	const email = emailInp.value
	const password = passwordInp.value

	try {
		const res = await fetch("/login", {
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

		emailInp.value = ""
		passwordInp.value = ""

		const data = await res.json()
  	localStorage.setItem("token", data.token)

		window.location.href = "storepage.html"
	} catch (err) {
		console.error(err)
		alert("Network error or server offline")
	}
}

const goForgotPage = () => {
	window.location.href = "forgot.html"
}

forgotBtn.addEventListener("click", goForgotPage)
logBtn.addEventListener("click", logUser)

document.addEventListener("keydown", event => {
	if (event.key === "Enter") logUser()
})