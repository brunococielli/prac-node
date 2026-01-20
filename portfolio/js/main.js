const links = document.querySelectorAll(".hero-nav a")
const pages = document.querySelectorAll(".page")

links.forEach(link => {
  link.addEventListener("click", event => {
    event.preventDefault()

    const targetId = link.dataset.section

    pages.forEach(page => {
      page.classList.remove("active")
    })

    const targetPage = document.getElementById(targetId)
    targetPage.classList.add("active")

    links.forEach(l => {
      l.classList.remove("active")
    })

    link.classList.add("active")
  })
})

document.querySelector('.hero-nav a[data-section="projects"]').classList.add("active")
document.getElementById("projects").classList.add("active")