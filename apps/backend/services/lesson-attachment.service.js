const { query } = require('../config/db');
const fs = require('fs');
const path = require('path');

async function listAttachmentsByLesson(lessonId) {
  return query(
    'SELECT * FROM lesson_attachments WHERE lesson_id = $1 ORDER BY created_at ASC',
    [lessonId]
  );
}

async function createFileAttachment({ lessonId, filename, originalName, mimeType, url }) {
  const type = mimeType.startsWith('image/') ? 'image'
    : mimeType.startsWith('video/') ? 'video'
    : 'file';

  const rows = await query(
    `INSERT INTO lesson_attachments (lesson_id, type, filename, original_name, mime_type, url)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [lessonId, type, filename, originalName, mimeType, url]
  );
  return rows[0];
}

async function createVideoUrlAttachment({ lessonId, url }) {
  const rows = await query(
    `INSERT INTO lesson_attachments (lesson_id, type, url)
     VALUES ($1, 'video_url', $2) RETURNING *`,
    [lessonId, url]
  );
  return rows[0];
}

async function deleteAttachment(id) {
  const rows = await query('SELECT * FROM lesson_attachments WHERE id = $1', [id]);
  const attachment = rows[0];
  if (!attachment) return;

  if (attachment.filename) {
    const filePath = path.join(__dirname, '..', 'uploads', 'lessons', attachment.filename);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  }

  await query('DELETE FROM lesson_attachments WHERE id = $1', [id]);
}

module.exports = {
  listAttachmentsByLesson,
  createFileAttachment,
  createVideoUrlAttachment,
  deleteAttachment,
};
