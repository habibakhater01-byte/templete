import multer from 'multer';
import path from 'path';

export default multer({
  storage: multer.diskStorage({
    destination: path.join(import.meta.dirname, '..', 'uploads'),
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
  }),
  fileFilter: (req, file, cb) => cb(null, file.mimetype.startsWith('image/')),
  limits: { fileSize: 5 * 1024 * 1024 },
});