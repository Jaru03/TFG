import prisma from '../config/prisma.js';

function toUser(p) {
  if (!p) return null;
  return {
    id: p.id,
    google_id: p.googleId,
    name: p.name,
    email: p.email,
    role_id: p.roleId,
    created_at: p.createdAt,
    role: p.role?.name ?? null,
  };
}

async function findByGoogleId(googleId) {
  return toUser(await prisma.user.findUnique({
    where: { googleId },
    include: { role: true },
  }));
}

async function findById(id) {
  return toUser(await prisma.user.findUnique({
    where: { id: Number(id) },
    include: { role: true },
  }));
}

async function createUser({ googleId, name, email, role = 'alumno' }) {
  const roleRecord = await prisma.role.findUnique({ where: { name: role } });
  return toUser(await prisma.user.create({
    data: { googleId, name, email, roleId: roleRecord.id },
    include: { role: true },
  }));
}

async function updateRole(userId, roleName) {
  const roleRecord = await prisma.role.findUnique({ where: { name: roleName } });
  if (!roleRecord) return null;
  return toUser(await prisma.user.update({
    where: { id: Number(userId) },
    data: { roleId: roleRecord.id },
    include: { role: true },
  }));
}

async function listUsers() {
  const users = await prisma.user.findMany({
    include: { role: true },
    orderBy: { createdAt: 'desc' },
  });
  return users.map(toUser);
}

async function updateUser(id, { name, email }) {
  return toUser(await prisma.user.update({
    where: { id: Number(id) },
    data: { name, email },
    include: { role: true },
  }));
}

async function deleteUserById(id) {
  await prisma.user.delete({ where: { id: Number(id) } });
}

export { findByGoogleId, findById, createUser, updateRole, updateUser, listUsers, deleteUserById };
