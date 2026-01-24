import { goLogInPage, goRegisterPage } from "./utils.js"

document.addEventListener("DOMContentLoaded", () => {
    const logBtn = document.querySelector(".logBtn")
    const forgotBtn = document.getElementById("forgotBtn")

    logBtn.addEventListener("click", goLogInPage)
    forgotBtn.addEventListener("click", goRegisterPage)
})

const token = localStorage.getItem("token")
const checkToken = async () => {
  if (!token) return

  try {
    const res = await fetch("/check", {
      headers: { Authorization: token }
    })

  if (res.ok) window.location.href = "storepage.html"

	} catch (err) {
		console.error("Network error:", err) 
	}
}

checkToken()