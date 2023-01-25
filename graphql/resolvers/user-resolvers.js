// @ts-nocheck
const { Op } = require("sequelize");
const isEmail = require("validator/lib/isEmail");
const bcrypt = require("bcryptjs");
const {
  UserInputError,
  AuthenticationError,
  ForbiddenError,
} = require("apollo-server");
const { sign } = require("jsonwebtoken");

const Message = require("../../models/message");
const User = require("../../models/user");

module.exports = {
  Query: {
    getUsers: async (_, __, { isAuth, username }) => {
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
    login: async (_, { username, password }) => {
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

        const token = sign({ username }, process.env.JWT_SECRET, {
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
    register: async (_, { username, email, password }) => {
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
        if (err.name === "SequelizeUniqueConstraintError") {
          const { errors } = err;
          error.message = errors[0].path + " is Already taken";
        } else if (err.name === "SequelizeValidationError") {
          const { errors } = err;
          error.message = errors[0].path + " is not valid";
        } else {
          error.message = err.message;
        }
        throw new UserInputError(error.message, { errors: error });
      }
    },
  },
};
