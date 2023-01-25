// @ts-nocheck
const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(
  process.env.DATABASE,
  process.env.DB_USERNAME,
  process.env.DB_PASSWORD,
  {
    dialect: "postgres",
    port: process.env.DB_PORT ? +process.env.DB_PORT : 3306,
    host: process.env.DB_HOST,
    dialectOptions: {
      ssl: true,
    },
  }
);

module.exports = sequelize;
