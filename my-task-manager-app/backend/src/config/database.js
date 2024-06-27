import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config(); // Charger les variables d'environnement

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  protocol: 'postgres',
  logging: false,
});

export default sequelize;
