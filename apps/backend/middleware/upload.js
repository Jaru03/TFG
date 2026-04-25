const multer = require('multer');
const path = require('path');
const fs = require('fs');

// ── Lessons ──────────────────────────────────────────────────────────────────
const LESSONS_DIR = path.join(__dirname, '..', 'uploads', 'lessons');
if (!fs.existsSync(LESSONS_DIR)) fs.mkdirSync(LESSONS_DIR, { recursive: true });

const lessonsStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, LESSONS_DIR),
  filename: (_req, file, cb) => {
    const safe = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    cb(null, `${Date.now()}-${safe}`);
  },
});

const upload = multer({
  storage: lessonsStorage,
  limits: { fileSize: 50 * 1024 * 1024 },
});

// ── Courses (cover image) ─────────────────────────────────────────────────────
const COURSES_DIR = path.join(__dirname, '..', 'uploads', 'courses');
if (!fs.existsSync(COURSES_DIR)) fs.mkdirSync(COURSES_DIR, { recursive: true });

const coursesStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, COURSES_DIR),
  filename: (_req, file, cb) => {
    const safe = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    cb(null, `${Date.now()}-${safe}`);
  },
});

const courseUpload = multer({
  storage: coursesStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Solo se permiten imágenes.'));
  },
});

module.exports = { upload, courseUpload };
