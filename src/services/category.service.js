const { Op } = require('sequelize');
const { Category, Transaction } = require('../models');

class CategoryService {

  async getCategories({ userId, type }) {
    const where = {
      [Op.or]: [{ userId }, { isSystem: true }]
    };
    if (type) where.type = type;

    return Category.findAll({ where, order: [['isSystem', 'DESC'], ['name', 'ASC']] });
  }

  async createCategory({ name, type, icon, color }, user) {
    if (!name || !type)
      throw Object.assign(new Error('Nombre y tipo son requeridos'), { status: 400 });
    if (!['income', 'expense'].includes(type))
      throw Object.assign(new Error('Tipo debe ser income o expense'), { status: 400 });

    const isAdminUser = user.role === 'admin';
    return Category.create({
      name,
      type,
      icon: icon || (type === 'income' ? '💰' : '💸'),
      color: color || '#6366f1',
      isSystem: isAdminUser,
      userId: isAdminUser ? null : user.id
    });
  }

  async updateCategory(id, { name, icon, color }, user) {
    const category = await Category.findByPk(id);
    if (!category)
      throw Object.assign(new Error('Categoría no encontrada'), { status: 404 });

    if (category.isSystem && user.role !== 'admin')
      throw Object.assign(new Error('No puedes editar categorías del sistema'), { status: 403 });
    if (!category.isSystem && category.userId !== user.id)
      throw Object.assign(new Error('No autorizado'), { status: 403 });

    if (name)  category.name  = name;
    if (icon)  category.icon  = icon;
    if (color) category.color = color;
    await category.save();

    return category;
  }

  async deleteCategory(id, user) {
    const category = await Category.findByPk(id);
    if (!category)
      throw Object.assign(new Error('Categoría no encontrada'), { status: 404 });

    if (category.isSystem && user.role !== 'admin')
      throw Object.assign(new Error('No puedes eliminar categorías del sistema'), { status: 403 });
    if (!category.isSystem && category.userId !== user.id)
      throw Object.assign(new Error('No autorizado'), { status: 403 });

    const hasTransactions = await Transaction.count({ where: { categoryId: category.id } });
    if (hasTransactions > 0)
      throw Object.assign(
        new Error(`No se puede eliminar: tiene ${hasTransactions} transacciones asociadas`),
        { status: 400 }
      );

    await category.destroy();
    return { message: 'Categoría eliminada' };
  }
}

module.exports = new CategoryService();