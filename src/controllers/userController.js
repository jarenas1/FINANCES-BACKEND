const userService = require('../services/user.service');

class UserController {

  async getAllUsers(req, res) {
    try {
      const result = await userService.getAllUsers();
      res.json(result);
    } catch (error) {
      res.status(error.status || 500).json({ message: error.message });
    }
  }

  async toggleUserStatus(req, res) {
    try {
      const result = await userService.toggleUserStatus(req.params.id);
      res.json(result);
    } catch (error) {
      res.status(error.status || 500).json({ message: error.message });
    }
  }

  async deleteUser(req, res) {
    try {
      const result = await userService.deleteUser(req.params.id, req.user.id);
      res.json(result);
    } catch (error) {
      res.status(error.status || 500).json({ message: error.message });
    }
  }

  async updateProfile(req, res) {
    try {
      const result = await userService.updateProfile(req.user, req.body);
      res.json(result);
    } catch (error) {
      res.status(error.status || 500).json({ message: error.message });
    }
  }

  async changePassword(req, res) {
    try {
      const result = await userService.changePassword(req.user, req.body);
      res.json(result);
    } catch (error) {
      res.status(error.status || 500).json({ message: error.message });
    }
  }
}

module.exports = new UserController();