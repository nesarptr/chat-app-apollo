const { UserInputError, AuthenticationError } = require("apollo-server");
const { withFilter } = require("apollo-server");
const { Op } = require("sequelize");

const User = require("../../models/user");
const Message = require("../../models/message");

module.exports = {
  Query: {
    getMessages: async (_, { from }, { username, isAuth }) => {
      try {
        if (!isAuth) throw new AuthenticationError("User is not Authenticated");

        const otherUser = await User.findOne({
          where: { username: from },
        });
        if (!otherUser) throw new UserInputError("User not found");

        const usernames = [username, otherUser.dataValues.username];

        const messages = await Message.findAll({
          where: {
            from: { [Op.in]: usernames },
            to: { [Op.in]: usernames },
          },
          order: [["createdAt", "DESC"]],
        });

        return messages;
      } catch (err) {
        console.error(err);
        throw err;
      }
    },
  },
  Mutation: {
    sendMessage: async (_, { to, content }, { username, isAuth, pubsub }) => {
      try {
        if (!isAuth) throw new AuthenticationError("User is not Authenticated");

        const recipient = await User.findOne({ where: { username: to } });

        if (!recipient) {
          throw new UserInputError("User not found");
        } else if (recipient.dataValues.username === username) {
          throw new UserInputError("You can't message yourself");
        }

        if (content.trim() === "") {
          throw new UserInputError("Message is empty");
        }

        const message = await Message.create({
          from: username,
          to,
          content,
        });

        pubsub?.publish("NEW_MESSAGE", { newMessage: message });

        return message;
      } catch (err) {
        console.error(err);
        throw err;
      }
    },
  },
  Subscription: {
    newMessage: {
      subscribe: withFilter(
        (_, __, { pubsub, username }) => {
          if (!username)
            throw new AuthenticationError("user is not authenticated");
          return pubsub.asyncIterator(["NEW_MESSAGE"]);
        },
        ({ newMessage }, _, { username }) =>
          newMessage.from === username || newMessage.to === username
      ),
    },
  },
};
