const authService = require('../services/auth.service');

class AuthController {

  async register(req, res) {
    try {
      const result = await authService.register(req.body);
      res.status(201).json(result);
    } catch (error) {
      res.status(error.status || 500).json({ message: error.message });
    }
  }

  async login(req, res) {
    try {
      const result = await authService.login(req.body);
      res.json(result);
    } catch (error) {
      res.status(error.status || 500).json({ message: error.message });
    }
  }

  me(req, res) {
    res.json(authService.me(req.user));
  }
}

module.exports = new AuthController();