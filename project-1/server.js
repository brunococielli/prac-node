import express from "express"

const app = express()
app.use(express.json())

app.use(express.static("public"))

let notes = []

app.get("/notes", (req, res) => {
  res.json(notes)
})

app.get("/notes/:id", (req, res) => {
  const id = req.params.id
  const note = notes.find(n => n.id === id)

  if (note) {
    res.json(note)
  } else {
    res.status(404).json({ error: "Note not found" })
  }
})

app.post("/notes", (req, res) => {
  const { title, content } = req.body
  const note = { id: Date.now().toString(), title, content }
  notes.push(note)
  res.json(note)
})

app.delete("/notes/:id", (req, res) => {
  const { id } = req.params
  notes = notes.filter(n => n.id !== id)
  res.json({ success: true })
})

app.listen(3000, () => console.log("Server running on port 3000"))