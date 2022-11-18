const { AuthenticationError } = require('apollo-server-express');
const { User } = require('../models');
const { signToken } = require('../utils/auth');

const resolvers = {
  Query: {
    //All users
    users: async () => {
      return User.find({});
    },

    user: async (parent, { userId }) => {
      return User.findOne({ _id: userId });
    },

    me: async (parent, args, context) => {
      if (context.user) {
        return User.findOne({ _id: context.user._id });
      }
      throw new AuthenticationError('You need to be logged in!');
    },
  },

  Mutation: {
    // Create user object based on User model
    createUser: async (parent, args) => {
      try {
        const user = await User.create(args);
        const token = signToken(user);
        return { token, user };
      } catch (err) {
        console.log(err);
      }
    },

    //Login after checking pw and giving token
    login: async (parent, { email, password }) => {
      try {
        const user = await User.findOne({
          $or: [{ username: email }, { email: email }],
        });
        if (!user) {
          throw new AuthenticationError(
            'No user found with this email address'
          );
        }
        const correctPw = await user.isCorrectPassword(password);
        if (!correctPw) {
          throw new AuthenticationError('Incorrect credentials');
        }

        const token = signToken(user);

        return { token, user };
      } catch (err) {
        console.log(err);
      }
    },

    //Save a book to the user
    saveBook: async (parent, args, context) => {
      try {
        if (context.user) {
          return await User.findOneAndUpdate(
            { _id: context.user._id },
            { $addToSet: { savedBooks } },
            { new: true, runValidators: true }
          );
        }
        throw new AuthenticationError('You need to be logged in!');
      } catch (err) {
        console.log(err);
      }
    },

    //Delete a book from the user
    deleteBook: async (parent, args, context) => {
      try {
        if (context.user) {
          return await User.findOneAndUpdate(
            { _id: context.user._id },
            { $pull: { savedBooks: { bookId: bookId } } },
            { new: true }
          );
        }
        throw new AuthenticationError('You need to be logged in!');
      } catch (err) {
        console.log(err);
      }
    },
  },
};

module.exports = resolvers;
