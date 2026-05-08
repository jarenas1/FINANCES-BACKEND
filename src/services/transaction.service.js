const { Op } = require('sequelize');
const { Transaction, Category } = require('../models');

class TransactionService {

  #MONTHS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  #DAYS   = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  #getDateRange(period) {
    const now = new Date();
    let start, end;

    switch (period) {
      case 'week':
        start = new Date(now);
        start.setDate(now.getDate() - 6);
        end = now;
        break;
      case 'quarter': {
        const q = Math.floor(now.getMonth() / 3);
        start = new Date(now.getFullYear(), q * 3, 1);
        end   = new Date(now.getFullYear(), q * 3 + 3, 0);
        break;
      }
      case 'year':
        start = new Date(now.getFullYear(), 0, 1);
        end   = new Date(now.getFullYear(), 11, 31);
        break;
      default: // mes por defecto
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        end   = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    }

    return {
      start: start.toISOString().split('T')[0],
      end:   end.toISOString().split('T')[0]
    };
  }

  async #calcRange(userId, start, end) {
    const txs = await Transaction.findAll({
      where: { userId, date: { [Op.between]: [start, end] } }
    });
    const income  = txs.filter(t => t.type === 'income') .reduce((s, t) => s + parseFloat(t.amount), 0);
    const expense = txs.filter(t => t.type === 'expense').reduce((s, t) => s + parseFloat(t.amount), 0);
    return { income, expense, balance: income - expense };
  }

  async getTransactions({ userId, type, categoryId, startDate, endDate, page = 1, limit = 20 }) {
    const where = { userId };

    if (type)       where.type       = type;
    if (categoryId) where.categoryId = categoryId;
    if (startDate && endDate) where.date = { [Op.between]: [startDate, endDate] };
    else if (startDate)       where.date = { [Op.gte]: startDate };
    else if (endDate)         where.date = { [Op.lte]: endDate };

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const { count, rows } = await Transaction.findAndCountAll({
      where,
      include: [{ model: Category, as: 'category' }],
      order: [['date', 'DESC'], ['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset
    });

    return { transactions: rows, total: count, pages: Math.ceil(count / limit), page: parseInt(page) };
  }

  async createTransaction({ amount, description, date, type, categoryId }, userId) {
    if (!amount || !type || !categoryId || !date)
      throw Object.assign(new Error('Monto, tipo, categoría y fecha son requeridos'), { status: 400 });

    const category = await Category.findByPk(categoryId);
    if (!category)
      throw Object.assign(new Error('Categoría no encontrada'), { status: 404 });
    if (category.type !== type)
      throw Object.assign(new Error('El tipo de categoría no coincide con el tipo de transacción'), { status: 400 });

    const transaction = await Transaction.create({
      amount: parseFloat(amount),
      description: description || '',
      date,
      type,
      categoryId,
      userId
    });

    return Transaction.findByPk(transaction.id, { include: [{ model: Category, as: 'category' }] });
  }

  async updateTransaction(id, userId, { amount, description, date, categoryId }) {
    const tx = await Transaction.findOne({ where: { id, userId } });
    if (!tx)
      throw Object.assign(new Error('Transacción no encontrada'), { status: 404 });

    if (amount      !== undefined) tx.amount      = parseFloat(amount);
    if (description !== undefined) tx.description = description;
    if (date        !== undefined) tx.date        = date;
    if (categoryId  !== undefined) tx.categoryId  = categoryId;
    await tx.save();

    return Transaction.findByPk(tx.id, { include: [{ model: Category, as: 'category' }] });
  }

  async deleteTransaction(id, userId) {
    const tx = await Transaction.findOne({ where: { id, userId } });
    if (!tx)
      throw Object.assign(new Error('Transacción no encontrada'), { status: 404 });

    await tx.destroy();
    return { message: 'Transacción eliminada' };
  }

  async getSummary({ userId, period, startDate, endDate }) {
    const range = (startDate && endDate) ? { start: startDate, end: endDate } : this.#getDateRange(period || 'month');

    const periodTxs = await Transaction.findAll({
      where: { userId, date: { [Op.between]: [range.start, range.end] } },
      include: [{ model: Category, as: 'category' }]
    });

    const income  = periodTxs.filter(t => t.type === 'income') .reduce((s, t) => s + parseFloat(t.amount), 0);
    const expense = periodTxs.filter(t => t.type === 'expense').reduce((s, t) => s + parseFloat(t.amount), 0);

    const allTxs     = await Transaction.findAll({ where: { userId } });
    const totalIncome  = allTxs.filter(t => t.type === 'income') .reduce((s, t) => s + parseFloat(t.amount), 0);
    const totalExpense = allTxs.filter(t => t.type === 'expense').reduce((s, t) => s + parseFloat(t.amount), 0);

    return {
      period:           range,
      income,
      expense,
      balance:          income - expense,
      savingsRate:      income > 0 ? Math.round(((income - expense) / income) * 100) : 0,
      totalBalance:     totalIncome - totalExpense,
      transactionCount: periodTxs.length
    };
  }

  async getChartData({ userId, period = 'month', year, month }) {
    const now       = new Date();
    const chartData = [];

    const push = async (start, end, label) => {
      const { income, expense, balance } = await this.#calcRange(userId, start, end);
      chartData.push({ label, income, expense, balance });
    };

    if (period === 'year') {
      const y = parseInt(year) || now.getFullYear();
      for (let m = 0; m < 12; m++) {
        const lastDay = new Date(y, m + 1, 0).getDate();
        const start = `${y}-${String(m + 1).padStart(2, '0')}-01`;
        const end   = `${y}-${String(m + 1).padStart(2, '0')}-${lastDay}`;
        await push(start, end, this.#MONTHS[m]);
      }
    } else if (period === 'month') {
      const y           = parseInt(year) || now.getFullYear();
      const mo          = parseInt(month) || now.getMonth() + 1;
      const daysInMonth = new Date(y, mo, 0).getDate();
      const weeks       = Math.ceil(daysInMonth / 7);
      for (let w = 0; w < weeks; w++) {
        const sd    = w * 7 + 1;
        const ed    = Math.min((w + 1) * 7, daysInMonth);
        const start = `${y}-${String(mo).padStart(2, '0')}-${String(sd).padStart(2, '0')}`;
        const end   = `${y}-${String(mo).padStart(2, '0')}-${String(ed).padStart(2, '0')}`;
        await push(start, end, `Sem ${w + 1}`);
      }
    } else if (period === 'week') {
      for (let d = 6; d >= 0; d--) {
        const date = new Date(now);
        date.setDate(now.getDate() - d);
        const ds = date.toISOString().split('T')[0];
        await push(ds, ds, this.#DAYS[date.getDay()]);
      }
    } else if (period === 'last6months') {
      for (let i = 5; i >= 0; i--) {
        const d       = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const y       = d.getFullYear();
        const m       = d.getMonth();
        const lastDay = new Date(y, m + 1, 0).getDate();
        const start   = `${y}-${String(m + 1).padStart(2, '0')}-01`;
        const end     = `${y}-${String(m + 1).padStart(2, '0')}-${lastDay}`;
        await push(start, end, `${this.#MONTHS[m]} ${y !== now.getFullYear() ? y : ''}`);
      }
    }

    return chartData;
  }

  async getCategoryBreakdown({ userId, type = 'expense', period, startDate, endDate }) {
    const range = (startDate && endDate) ? { start: startDate, end: endDate } : this.#getDateRange(period || 'month');

    const transactions = await Transaction.findAll({
      where: { userId, type, date: { [Op.between]: [range.start, range.end] } },
      include: [{ model: Category, as: 'category' }]
    });

    const breakdown = {};
    transactions.forEach((t) => {
      const key = t.category?.name ?? 'Sin categoría';
      if (!breakdown[key]) {
        breakdown[key] = { name: key, amount: 0, color: t.category?.color || '#6366f1', icon: t.category?.icon || '💰' };
      }
      breakdown[key].amount += parseFloat(t.amount);
    });

    const total  = Object.values(breakdown).reduce((s, c) => s + c.amount, 0);
    const result = Object.values(breakdown)
      .map(c => ({ ...c, percentage: total > 0 ? Math.round((c.amount / total) * 100) : 0 }))
      .sort((a, b) => b.amount - a.amount);

    return { items: result, total };
  }
}

module.exports = new TransactionService();