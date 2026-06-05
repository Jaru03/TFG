import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOADS_DIR = path.join(__dirname, '..', 'uploads');

// Crea un storage de disco apuntando a uploads/<subdir>, creando la carpeta si
// no existe. El nombre de fichero se sanea y se prefija con un timestamp para
// evitar colisiones. Compartido por lecciones y portadas de curso.
function makeDiskStorage(subdir) {
  const dir = path.join(UPLOADS_DIR, subdir);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  return multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, dir),
    filename: (_req, file, cb) => {
      const safe = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
      cb(null, `${Date.now()}-${safe}`);
    },
  });
}

// Adjuntos de lecciones: cualquier tipo, hasta 50 MB.
const upload = multer({
  storage: makeDiskStorage('lessons'),
  limits: { fileSize: 50 * 1024 * 1024 },
});

// Portada de curso: solo imágenes, hasta 5 MB.
const courseUpload = multer({
  storage: makeDiskStorage('courses'),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Solo se permiten imágenes.'));
  },
});

export { upload, courseUpload };
