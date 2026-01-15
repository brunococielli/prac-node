const logoutBtn = document.getElementById("logoutBtn")
const fileInput = document.getElementById("fileInput")
const uploadBtn = document.getElementById("uploadBtn")
const imagesDiv = document.getElementById("imagesDiv")
const modal = document.getElementById("imageModal")
const modalImage = document.getElementById("modalImage")
const closeBtn = document.getElementById("closeBtn")
const deleteBtn = document.getElementById("deleteBtn")

let currentImageSrc = null

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

	if (!userIMG) return alert("no image chosen")

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

		img.addEventListener("click", () => {
			openModal(src)
		})

    imagesDiv.appendChild(img)
  })
}

const openModal = (src) => {
  currentImageSrc = src
  modalImage.src = src
  modal.classList.remove("hidden")
}

const closeModal = () => {
  modal.classList.add("hidden")
  modalImage.src = ""
  currentImageSrc = null
}

closeBtn.addEventListener("click", closeModal)

modal.addEventListener("click", (e) => {
  if (e.target === modal) closeModal()
})

deleteBtn.addEventListener("click", async () => {
  if (!currentImageSrc) return

  const confirmDelete = confirm("Are you sure you want to delete this image?")
  if (!confirmDelete) return

  const token = getToken()

  const response = await fetch("/deleteImage", {
    method: "DELETE",
    headers: {
      Authorization: token,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ src: currentImageSrc }),
  })

  if (!response.ok) return alert("Failed to delete image")
  
  closeModal()
  loadImages()
})

uploadBtn.addEventListener("click", () => fileInput.click())
logoutBtn.addEventListener("click", logoutUser)
loadImages()