import multer from "multer"
import path from "path"

const uploadDir = path.join(process.cwd(), "project-2", "uploads")

const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => {
    const uniqueName =
      Date.now() + "-" + Math.round(Math.random() * 1e9)

    cb(null, uniqueName + path.extname(file.originalname))
  },
})

export const upload = multer({
  storage,
  limits: { fileSize: 30 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Only images allowed"))
    }
    cb(null, true)
  },
})