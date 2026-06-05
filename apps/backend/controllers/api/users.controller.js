import { wrapController } from '../../middleware/errorHandler.js';
import { listUsers as listUsersService, updateRole, findById } from '../../services/user.service.js';
import { deleteUserById } from '../../services/user.service.js';

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

export default wrapController({
  listUsers,
  changeUserRole,
  deleteUser
});
