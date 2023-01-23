import {
  UniqueConstraintError,
  ValidationError,
  Error as SQLError,
  Op,
} from "sequelize";
import isEmail from "validator/lib/isEmail";
import bcrypt from "bcryptjs";
import {
  UserInputError,
  AuthenticationError,
  ForbiddenError,
} from "apollo-server";
import { sign } from "jsonwebtoken";

import Message from "../../models/message";
import User from "../../models/user";
import { authContext, registerFuncArgs, loginFuncArgs } from "../../types";

export default {
  Query: {
    getUsers: async (_: null, __: null, { isAuth, username }: authContext) => {
      try {
        if (!isAuth) {
          throw new ForbiddenError("User is unauthorized");
        }
        let users = await User.findAll({
          where: { username: { [Op.ne]: username } },
        });

        const allUserMessages = await Message.findAll({
          where: {
            [Op.or]: [{ from: username }, { to: username }],
          },
          order: [["createdAt", "DESC"]],
        });

        users = users.map((otherUser) => {
          const latestMessage = allUserMessages.find((m) => {
            return (
              m.dataValues.from === otherUser.dataValues.username ||
              m.dataValues.to === otherUser.dataValues.username
            );
          });
          return {
            ...otherUser.dataValues,
            latestMessage: latestMessage,
          };
        });

        return users;
      } catch (err) {
        console.error(err);
        throw err;
      }
    },
    login: async (_: null, { username, password }: loginFuncArgs) => {
      try {
        if (!username?.trim() || username.trim().length < 2) {
          throw new UserInputError("Bad username");
        }
        if (!password?.trim() || password.length < 6) {
          throw new Error("Bad Password");
        }
        const user = await User.findOne({
          where: { username },
        });
        if (!user) {
          throw new AuthenticationError("username or password is not valid");
        }
        const isCorrect = await bcrypt.compare(
          password,
          user.dataValues.password
        );

        if (!isCorrect) {
          throw new AuthenticationError("username or password is not valid");
        }

        const token = sign({ username }, process.env.JWT_SECRET as string, {
          expiresIn: 60 * 60,
        });

        return {
          ...user.toJSON(),
          token,
        };
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
  },
  Mutation: {
    register: async (
      _: null,
      { username, email, password }: registerFuncArgs
    ) => {
      try {
        if (!isEmail(email)) {
          throw new Error("Invalid Email");
        }
        if (!username?.trim() || username.trim().length < 2) {
          throw new Error("Invalid username");
        }
        if (!password?.trim() || password.length < 6) {
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
