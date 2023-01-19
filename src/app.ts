import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";

import { typeDefs } from "./graphql/schema";
import { resolvers } from "./graphql/resolvers";
import sequelize from "./config/database";
import User from "./models/user";

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

sequelize
  .sync()
  .then(() => {
    return User.findAll();
  })
  .then((res) => {
    console.log(res.length);
    if (res.length === 0) {
      return User.bulkCreate([
        {
          username: "john",
          email: "john@email.com",
          password: "johnpass",
        },
        {
          username: "jane",
          email: "jane@email.com",
          password: "janepass",
        },
      ]);
    }
    return res;
  })
  .then((res) => {
    res.forEach((user) => {
      console.log(user.dataValues);
    });
    return startStandaloneServer(server, {
      listen: { port: process.env.PORT ? +process.env.PORT : 4000 },
    });
  })
  .then(({ url }) => {
    console.log(`🚀  Server ready at: ${url}`);
  })
  .catch((err) => console.error(err));
