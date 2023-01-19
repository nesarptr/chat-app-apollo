import { Sequelize } from "sequelize";

const sequelize = new Sequelize(
  process.env.DATABASE as string,
  process.env.DB_USERNAME as string,
  process.env.DB_PASSWORD,
  {
    dialect: "postgres",
    port: process.env.DB_PORT ? +process.env.DB_PORT : 3306,
    host: process.env.DB_HOST,
    dialectOptions: {
      ssl: false,
    },
  }
);

export default sequelize;
