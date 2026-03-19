const { listUsers: listUsersService, updateRole, findById } = require('../../services/user.service');
const { deleteUserById } = require('../../services/user.service');

async function listUsers(req, res) {
  const users = await listUsersService();
  res.json(users);
}

async function changeUserRole(req, res) {
  const { role } = req.body;
  const { id } = req.params;

  const user = await findById(id);
  if (!user) {
    return res.status(404).json({ message: 'Usuario no encontrado' });
  }

  const updated = await updateRole(id, role);
  res.json(updated);
}

async function deleteUser(req, res) {
  const { id } = req.params;
  const user = await findById(id);
  if (!user) {
    return res.status(404).json({ message: 'Usuario no encontrado' });
  }

  await deleteUserById(id);
  res.status(204).end();
}

module.exports = {
  listUsers,
  changeUserRole,
  deleteUser
};
