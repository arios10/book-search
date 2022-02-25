const { User, Book } = require('../models');
const { AuthenticationError } = require('apollo-server-express');
const { signToken } = require('../utils/auth');

const resolvers = {
    Query: {
        //query me
        me: async (parent, args, context) => {
            if (context.user) {
                const userData = await User.findOne({ _id: context.user._id })
                .select('-__v -password')
                return userData;
            }

            throw new AuthenticationError('Not logged in');
        }
    },
    Mutation: {
        //create user, add token, return
        addUser: async (parent, args) => {
            const user = await User.create(args);
            const token = signToken(user);

            return { token, user };
        },
        //log a user, add token, return
        login: async (parent, { email, password }) => {
            
            const user = await User.findOne( { email });
            
            //if user email isn't found error
            if (!user) {
                throw new AuthenticationError('Incorrect credentials')
            }

            const correctPw = await user.isCorrectPassword(password);
            
            //if incorrect password error
            if(!correctPw) {
                throw new AuthenticationError('Incorrect credentials')
            }

            //assign token
            const token = signToken(user);
            return { token, user };
        },

        saveBook: async (parent, { book }, context) => {
            if (context.user) {
                const updatedUser = await User.findOneAndUpdate(
                    { _id: context.user._id },
                    { $addToSet: {savedBooks: book} },
                    { new: true }
                )
                return updatedUser;
            }
            throw new AuthenticationError('You need to be logged in!')
        },
        //removeBook:
    }
  };

  module.exports = resolvers;