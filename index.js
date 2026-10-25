import 'dotenv/config';
import express from 'express';
import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';
import multer from 'multer';
import path from 'path';
import { pool } from './db/index.js';
import authRoutes from './routes/auth.routes.js';
import postRoutes from './routes/post.routes.js';
import { pagesRouter as pagesRoutes } from './routes/pages.routes.js';

const PgSession = connectPgSimple(session);
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(import.meta.dirname, 'uploads')));

app.use(
  session({
    store: new PgSession({ pool, createTableIfMissing: true }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { httpOnly: true, maxAge: 1000 * 60 * 60 * 24 },
  })
);

app.use('/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use(pagesRoutes);

app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    const msg = err.code === 'LIMIT_FILE_SIZE' ? 'Image must be 5MB or less' : err.message;
    return res.status(400).json({ error: 'Upload failed', errors: { image: { errors: [msg] } } });
  }
  const code = err.code || err.cause?.code;
  if (code === '23505') return res.status(409).json({ error: 'Already exists' });
  if (code === '23503') return res.status(404).json({ error: 'Related record not found' });
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(3000, () => console.log('Server running on http://localhost:3000'));