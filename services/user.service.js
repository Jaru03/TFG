const { query } = require('../config/db');

async function findByGoogleId(googleId) {
  const rows = await query(
    'SELECT u.*, r.name AS role FROM users u JOIN roles r ON u.role_id = r.id WHERE u.google_id = $1',
    [googleId]
  );
  return rows[0] || null;
}

async function findById(id) {
  const rows = await query(
    'SELECT u.*, r.name AS role FROM users u JOIN roles r ON u.role_id = r.id WHERE u.id = $1',
    [id]
  );
  return rows[0] || null;
}

async function findByEmail(email) {
  const rows = await query(
    'SELECT u.*, r.name AS role FROM users u JOIN roles r ON u.role_id = r.id WHERE u.email = $1',
    [email]
  );
  return rows[0] || null;
}

async function getRoleId(roleName) {
  const rows = await query('SELECT id FROM roles WHERE name = $1', [roleName]);
  return rows[0] ? rows[0].id : null;
}

async function createUser({ googleId, name, email, role = 'alumno' }) {
  const roleId = await getRoleId(role);
  const rows = await query(
    'INSERT INTO users (google_id, name, email, role_id) VALUES ($1, $2, $3, $4) RETURNING id',
    [googleId, name, email, roleId]
  );
  const userId = rows[0].id;
  return findById(userId);
}

async function updateRole(userId, roleName) {
  const roleId = await getRoleId(roleName);
  if (!roleId) return null;
  await query('UPDATE users SET role_id = $1 WHERE id = $2', [roleId, userId]);
  return findById(userId);
}

async function listUsers() {
  return query(
    'SELECT u.id, u.name, u.email, r.name AS role, u.created_at FROM users u JOIN roles r ON u.role_id = r.id ORDER BY u.created_at DESC'
  );
}

async function deleteUserById(id) {
  await query('DELETE FROM users WHERE id = $1', [id]);
}

module.exports = {
  findByGoogleId,
  findById,
  findByEmail,
  createUser,
  updateRole,
  listUsers,
  deleteUserById
};
