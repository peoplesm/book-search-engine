const { User } = require('../models');

const resolvers = {
  Query: {
    //All users
    users: async () => {
      return await User.find({});
    },
  },
};

module.exports = resolvers;
