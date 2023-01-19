import User from "../models/user";

export const resolvers = {
  Query: {
    getUsers: async () => {
      try {
        const users = await User.findAll();
        return users;
      } catch (err) {
        console.error(err);
        throw err;
      }
    },
  },
};
