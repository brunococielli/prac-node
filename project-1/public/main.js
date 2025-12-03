const title = document.getElementById("title")
const content = document.getElementById("content")
const addBtn = document.getElementById("addBtn")
const notesContainer = document.getElementById("notesContainer")

let notes = []

addBtn.addEventListener("click", () => createNote())

const getNotesFromServer = async () => {
  const res = await fetch("http://localhost:3000/notes")
  notes = await res.json()
  renderNotes()
}

const createNote = async () => {
  const noteTitle = title.value
  const noteContent = content.value
  title.value = ""
  content.value = ""

  if (!noteTitle || !noteContent) return

  const res = await fetch("http://localhost:3000/notes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title: noteTitle, content: noteContent })
  })

  const newNote = await res.json()
  notes.push(newNote)
  addNoteToDOM(newNote)
}

const deleteNote = async id => {
  await fetch(`http://localhost:3000/notes/${id}`, { method: "DELETE" })

  notes = notes.filter(note => note.id !== id)

  const element = notesContainer.querySelector(`[data-id="${id}"]`)
  if (element) element.remove()
}

const addNoteToDOM = note => {
  const noteDiv = document.createElement("div")
  noteDiv.classList.add("note")
  noteDiv.dataset.id = note.id

  const noteHeader = document.createElement("h3")
  const noteText = document.createElement("p")
  const deleteBtn = document.createElement("button")

  noteHeader.textContent = note.title
  noteText.textContent = note.content
  deleteBtn.textContent = "Delete"

  deleteBtn.addEventListener("click", () => deleteNote(note.id))

  noteDiv.appendChild(noteHeader)
  noteDiv.appendChild(noteText)
  noteDiv.appendChild(deleteBtn)

  notesContainer.appendChild(noteDiv)
}

const renderNotes = () => {
  notesContainer.innerHTML = ""
  notes.forEach(addNoteToDOM)
}

getNotesFromServer()