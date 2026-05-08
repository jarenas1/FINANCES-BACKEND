const { User, Transaction, Category } = require('../models');

class UserService {

  async getAllUsers() {
    const users = await User.findAll({
      attributes: { exclude: ['password'] },
      include: [{ model: Transaction, as: 'transactions', attributes: ['amount', 'type'] }]
    });

    return users.map((user) => {
      const txs          = user.transactions || [];
      const totalIncome  = txs.filter(t => t.type === 'income') .reduce((s, t) => s + parseFloat(t.amount), 0);
      const totalExpense = txs.filter(t => t.type === 'expense').reduce((s, t) => s + parseFloat(t.amount), 0);
      return {
        id:               user.id,
        name:             user.name,
        email:            user.email,
        role:             user.role,
        isActive:         user.isActive,
        createdAt:        user.createdAt,
        totalIncome,
        totalExpense,
        balance:          totalIncome - totalExpense,
        transactionCount: txs.length
      };
    });
  }

  async toggleUserStatus(id) {
    const user = await User.findByPk(id);
    if (!user)
      throw Object.assign(new Error('Usuario no encontrado'), { status: 404 });
    if (user.role === 'admin')
      throw Object.assign(new Error('No se puede desactivar un admin'), { status: 400 });

    user.isActive = !user.isActive;
    await user.save();
    return { message: `Usuario ${user.isActive ? 'activado' : 'desactivado'}`, isActive: user.isActive };
  }

  async deleteUser(id, requesterId) {
    const user = await User.findByPk(id);
    if (!user)
      throw Object.assign(new Error('Usuario no encontrado'), { status: 404 });
    if (user.role === 'admin')
      throw Object.assign(new Error('No se puede eliminar un admin'), { status: 400 });
    if (user.id === requesterId)
      throw Object.assign(new Error('No puedes eliminarte a ti mismo'), { status: 400 });

    await Transaction.destroy({ where: { userId: user.id } });
    await Category.destroy({ where: { userId: user.id } });
    await user.destroy();
    return { message: 'Usuario eliminado correctamente' };
  }

  async updateProfile(user, { name, email }) {
    if (email && email !== user.email) {
      const exists = await User.findOne({ where: { email } });
      if (exists)
        throw Object.assign(new Error('El correo ya está en uso'), { status: 400 });
    }

    if (name)  user.name  = name;
    if (email) user.email = email;
    await user.save();

    return { id: user.id, name: user.name, email: user.email, role: user.role };
  }

  async changePassword(user, { currentPassword, newPassword }) {
    if (!currentPassword || !newPassword)
      throw Object.assign(new Error('Ambas contraseñas son requeridas'), { status: 400 });
    if (newPassword.length < 6)
      throw Object.assign(new Error('La nueva contraseña debe tener al menos 6 caracteres'), { status: 400 });

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch)
      throw Object.assign(new Error('Contraseña actual incorrecta'), { status: 401 });

    user.password = newPassword;
    await user.save();
    return { message: 'Contraseña actualizada correctamente' };
  }
}

module.exports = new UserService();