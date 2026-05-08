const jwt = require('jsonwebtoken');
const { User } = require('../models');

class AuthService {

  #generateToken(id) {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
  }

  #formatUser(user) {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    };
  }

  async register({ name, email, password }) {
    if (!name || !email || !password)
      throw Object.assign(new Error('Todos los campos son requeridos'), { status: 400 });
    if (password.length < 6)
      throw Object.assign(new Error('La contraseña debe tener al menos 6 caracteres'), { status: 400 });

    const existing = await User.findOne({ where: { email } });
    if (existing)
      throw Object.assign(new Error('El correo ya está registrado'), { status: 400 });

    const user = await User.create({ name, email, password });
    return { token: this.#generateToken(user.id), user: this.#formatUser(user) };
  }

  async login({ email, password }) {
    if (!email || !password)
      throw Object.assign(new Error('Email y contraseña requeridos'), { status: 400 });

    const user = await User.findOne({ where: { email } });
    if (!user || !user.isActive)
      throw Object.assign(new Error('Credenciales inválidas'), { status: 401 });

    const isMatch = await user.comparePassword(password);
    if (!isMatch)
      throw Object.assign(new Error('Credenciales inválidas'), { status: 401 });

    return { token: this.#generateToken(user.id), user: this.#formatUser(user) };
  }

  me(user) {
    return this.#formatUser(user);
  }
}

module.exports = new AuthService();