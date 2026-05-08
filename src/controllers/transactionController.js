const transactionService = require('../services/transaction.service');

class TransactionController {

  async getTransactions(req, res) {
    try {
      const result = await transactionService.getTransactions({ userId: req.user.id, ...req.query });
      res.json(result);
    } catch (error) {
      res.status(error.status || 500).json({ message: error.message });
    }
  }

  async createTransaction(req, res) {
    try {
      const result = await transactionService.createTransaction(req.body, req.user.id);
      res.status(201).json(result);
    } catch (error) {
      res.status(error.status || 500).json({ message: error.message });
    }
  }

  async updateTransaction(req, res) {
    try {
      const result = await transactionService.updateTransaction(req.params.id, req.user.id, req.body);
      res.json(result);
    } catch (error) {
      res.status(error.status || 500).json({ message: error.message });
    }
  }

  async deleteTransaction(req, res) {
    try {
      const result = await transactionService.deleteTransaction(req.params.id, req.user.id);
      res.json(result);
    } catch (error) {
      res.status(error.status || 500).json({ message: error.message });
    }
  }

  async getSummary(req, res) {
    try {
      const result = await transactionService.getSummary({ userId: req.user.id, ...req.query });
      res.json(result);
    } catch (error) {
      res.status(error.status || 500).json({ message: error.message });
    }
  }

  async getChartData(req, res) {
    try {
      const result = await transactionService.getChartData({ userId: req.user.id, ...req.query });
      res.json(result);
    } catch (error) {
      res.status(error.status || 500).json({ message: error.message });
    }
  }

  async getCategoryBreakdown(req, res) {
    try {
      const result = await transactionService.getCategoryBreakdown({ userId: req.user.id, ...req.query });
      res.json(result);
    } catch (error) {
      res.status(error.status || 500).json({ message: error.message });
    }
  }
}

module.exports = new TransactionController();