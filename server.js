require('dotenv').config();

async function main() {
  const app  = require('./src/app');
  const { sequelize } = require('./src/models');
  const seed = require('./src/seeders/seed');
  const PORT = process.env.PORT || 5000;

  try {
    await sequelize.authenticate();
    await sequelize.sync({ alter: true });
    await seed();
    app.listen(PORT, () => {
      console.log(`Servidor corriendo en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Error al iniciar el servidor:', error);
    process.exit(1);
  }
}

main();
