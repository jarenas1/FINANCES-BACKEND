const categoryService = require('../services/category.service');

class CategoryController {

  async getCategories(req, res) {
    try {
      const result = await categoryService.getCategories({ userId: req.user.id, type: req.query.type });
      res.json(result);
    } catch (error) {
      res.status(error.status || 500).json({ message: error.message });
    }
  }

  async createCategory(req, res) {
    try {
      const result = await categoryService.createCategory(req.body, req.user);
      res.status(201).json(result);
    } catch (error) {
      res.status(error.status || 500).json({ message: error.message });
    }
  }

  async updateCategory(req, res) {
    try {
      const result = await categoryService.updateCategory(req.params.id, req.body, req.user);
      res.json(result);
    } catch (error) {
      res.status(error.status || 500).json({ message: error.message });
    }
  }

  async deleteCategory(req, res) {
    try {
      const result = await categoryService.deleteCategory(req.params.id, req.user);
      res.json(result);
    } catch (error) {
      res.status(error.status || 500).json({ message: error.message });
    }
  }
}

module.exports = new CategoryController();