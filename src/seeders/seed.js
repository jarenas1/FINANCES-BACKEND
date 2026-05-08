const { User, Category } = require('../models');

const systemCategories = [
  // ─── Ingresos ───────────────────────────────────────
  { name: 'Salario',         type: 'income',  icon: '💼', color: '#10b981' },
  { name: 'Freelance',       type: 'income',  icon: '💻', color: '#3b82f6' },
  { name: 'Inversiones',     type: 'income',  icon: '📈', color: '#8b5cf6' },
  { name: 'Ventas',          type: 'income',  icon: '🛒', color: '#f59e0b' },
  { name: 'Regalos',         type: 'income',  icon: '🎁', color: '#ec4899' },
  { name: 'Alquiler',        type: 'income',  icon: '🏘️', color: '#06b6d4' },
  { name: 'Bonificación',    type: 'income',  icon: '🏆', color: '#22c55e' },
  { name: 'Otros ingresos',  type: 'income',  icon: '💰', color: '#6366f1' },

  // ─── Gastos ─────────────────────────────────────────
  { name: 'Alimentación',    type: 'expense', icon: '🍔', color: '#ef4444' },
  { name: 'Restaurantes',    type: 'expense', icon: '🍽️', color: '#f43f5e' },
  { name: 'Transporte',      type: 'expense', icon: '🚗', color: '#f97316' },
  { name: 'Vivienda',        type: 'expense', icon: '🏠', color: '#84cc16' },
  { name: 'Servicios',       type: 'expense', icon: '💡', color: '#eab308' },
  { name: 'Entretenimiento', type: 'expense', icon: '🎮', color: '#06b6d4' },
  { name: 'Salud',           type: 'expense', icon: '🏥', color: '#14b8a6' },
  { name: 'Educación',       type: 'expense', icon: '📚', color: '#a855f7' },
  { name: 'Ropa',            type: 'expense', icon: '👗', color: '#ec4899' },
  { name: 'Tecnología',      type: 'expense', icon: '📱', color: '#64748b' },
  { name: 'Viajes',          type: 'expense', icon: '✈️', color: '#0ea5e9' },
  { name: 'Mascotas',        type: 'expense', icon: '🐾', color: '#78716c' },
  { name: 'Deudas',          type: 'expense', icon: '💳', color: '#dc2626' },
  { name: 'Otros gastos',    type: 'expense', icon: '💸', color: '#94a3b8' }
];

const seed = async () => {
  try {
    //Crear un admin
    const adminExists = await User.findOne({ where: { email: 'admin@finance.com' } });
    if (!adminExists) {
      await User.create({
        name: 'Administrador',
        email: 'admin@finance.com',
        password: 'admin123',
        role: 'admin'
      });
    }

    //Crear categorias del sistema
    let created = 0;
    for (const cat of systemCategories) {
      const exists = await Category.findOne({ where: { name: cat.name, isSystem: true } });
      if (!exists) {
        await Category.create({ ...cat, isSystem: true, userId: null });
        created++;
      }
    }
  } catch (error) {
    console.error('Error en seed:', error.message);
  }
};

module.exports = seed;
