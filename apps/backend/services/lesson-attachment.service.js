import prisma from '../config/prisma.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function toAttachment(p) {
  if (!p) return null;
  return {
    id: p.id,
    lesson_id: p.lessonId,
    type: p.type,
    filename: p.filename,
    original_name: p.originalName,
    mime_type: p.mimeType,
    url: p.url,
    created_at: p.createdAt,
  };
}

async function listAttachmentsByLesson(lessonId) {
  const attachments = await prisma.lessonAttachment.findMany({
    where: { lessonId: Number(lessonId) },
    orderBy: { createdAt: 'asc' },
  });
  return attachments.map(toAttachment);
}

async function createFileAttachment({ lessonId, filename, originalName, mimeType, url }) {
  const type = mimeType.startsWith('image/') ? 'image'
    : mimeType.startsWith('video/') ? 'video'
    : 'file';

  return toAttachment(await prisma.lessonAttachment.create({
    data: { lessonId: Number(lessonId), type, filename, originalName, mimeType, url },
  }));
}

async function createVideoUrlAttachment({ lessonId, url }) {
  return toAttachment(await prisma.lessonAttachment.create({
    data: { lessonId: Number(lessonId), type: 'video_url', url },
  }));
}

async function deleteAttachment(id) {
  const attachment = await prisma.lessonAttachment.findUnique({ where: { id: Number(id) } });
  if (!attachment) return;

  if (attachment.filename) {
    const filePath = path.join(__dirname, '..', 'uploads', 'lessons', attachment.filename);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  }

  await prisma.lessonAttachment.delete({ where: { id: Number(id) } });
}

export { listAttachmentsByLesson, createFileAttachment, createVideoUrlAttachment, deleteAttachment };
