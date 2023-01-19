import {
  UniqueConstraintError,
  ValidationError,
  Error as SQLError,
} from "sequelize";
import isEmail from "validator/lib/isEmail";
import bcrypt from "bcryptjs";
import { UserInputError } from "apollo-server-errors";

import User from "../models/user";

type registerFuncArgs = {
  username: string;
  email: string;
  password: string;
};

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
  Mutation: {
    register: async (_: null, args: registerFuncArgs) => {
      const { username, email, password } = args;
      try {
        if (!isEmail(email)) {
          throw new Error("Invalid Email");
        }
        if (!username || username.trim().length < 2) {
          throw new Error("Invalid username");
        }
        if (!password || password.trim().length < 6) {
          throw new Error("Password is too weak");
        }

        const hashedPw = await bcrypt.hash(password, 12);

        const user = await User.create({
          username,
          email,
          password: hashedPw,
        });

        return user;
      } catch (err) {
        // console.error(err);
        let error = new Error();
        const e = err as Error | SQLError;
        if (e.name === "SequelizeUniqueConstraintError") {
          const { errors } = e as UniqueConstraintError;
          error.message = errors[0].path + " is Already taken";
        } else if (e.name === "SequelizeValidationError") {
          const { errors } = e as ValidationError;
          error.message = errors[0].path + " is not valid";
        } else {
          error.message = e.message;
        }
        throw new UserInputError(error.message, { errors: error });
      }
    },
  },
};
