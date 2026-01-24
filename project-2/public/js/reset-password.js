const passwordV = document.getElementById("password")
const resetForm = document.getElementById("resetForm")
const backBtn = document.getElementById("backBtn")

const params = new URLSearchParams(window.location.search)
const token = params.get("token")

  resetForm.addEventListener("submit", async (e) => {
    e.preventDefault()

		const newPassword = passwordV.value
		passwordV.value = ""

		if (!newPassword) return alert("Missing password!")

		const res = await fetch("/reset-password", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ token, newPassword })
		})

		if (!res.ok) {
			alert("Invalid or expired token")
			return
		}

		alert("Password reset")
		backBtn.style.display = "block"
})

backBtn.addEventListener("click", () => {
  window.location.href = "index.html"
	backBtn.style.display = "none"
})