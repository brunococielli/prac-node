import { goLogInPage, goRegisterPage } from "./utils.js"

document.addEventListener("DOMContentLoaded", () => {
    const logBtn = document.querySelector(".logBtn")
    const forgotBtn = document.getElementById("forgotBtn")

    logBtn.addEventListener("click", goLogInPage)
    forgotBtn.addEventListener("click", goRegisterPage)
})