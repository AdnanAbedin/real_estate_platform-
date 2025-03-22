import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const sequelize = new Sequelize({
  dialect: 'postgres',
  username: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'realestate_task',
  password: process.env.DB_PASSWORD || 'lasarara841',
  port: Number(process.env.DB_PORT) || 5432,
  pool: {
    max: 20,
    min: 0,
    idle: 30000,
    acquire: 2000,
  },
  logging: false,
});

export default sequelize;