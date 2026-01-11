const logoutBtn = document.getElementById("logoutBtn")
const fileInput = document.getElementById("fileInput")
const uploadBtn = document.getElementById("uploadBtn")
const imagesDiv = document.getElementById("imagesDiv")

const getToken = () => localStorage.getItem("token")

const logoutUser = async () => {
	const token = getToken()
	if (!token) return alert("not logged in!")

	await fetch("/logout", {
		method: "POST",
		headers: { Authorization: token }
	})

	localStorage.removeItem("token")

	window.location.href = "/"
}

fileInput.addEventListener("change", async () => {
	const token = getToken()
	if (!token) return alert("not logged in!")

  const userIMG = fileInput.files[0]

	if (!userIMG) return alert("Choose an image")

	const formData = new FormData()
	formData.append("image", userIMG)

	const response = await fetch("/upload", {
		method: "POST",
		body: formData,
		headers: { Authorization: token },
	})

	if (!response.ok) alert("upload failed!")

	loadImages()
})

const loadImages = async () => {
  const token = getToken()
  if (!token) return alert("not logged in!")

  const response = await fetch("/sendImages", {
    headers: { Authorization: token },
  })

  if (!response.ok) return alert("failed to load images")
    
  const images = await response.json()

	imagesDiv.innerHTML = ""

  images.forEach(src => {
    const img = document.createElement("img")
    img.src = src
    imagesDiv.appendChild(img)
  })
}

uploadBtn.addEventListener("click", () => fileInput.click())
logoutBtn.addEventListener("click", logoutUser)
loadImages()