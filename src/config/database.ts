import { Sequelize } from "sequelize";

console.log(process.env.DATABASE, process.env.USER, process.env.PASSWORD);

const sequelize = new Sequelize(
  process.env.DATABASE as string,
  process.env.USER as string,
  process.env.PASSWORD,
  {
    dialect: "mysql",
    host: process.env.HOST,
  }
);

export default sequelize;
