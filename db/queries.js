const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

module.exports = {
  prisma,
  // get all users
  getAllUsers: async () => {
    return await prisma.user.findMany();
  },

  // get user by id
  getUserById: async (id) => {
    return await prisma.user.findUnique({ where: { id } });
  },

  // get user by email
  getUserByEmail: async (email) => {
    return await prisma.user.findUnique({ where: { email } });
  },

  // get user by username
  getUserByUsername: async (username) => {
    return await prisma.user.findUnique({ where: { username } });
  },

  // create user
  createUser: async (data) => {
    return await prisma.user.create({ data });
  },

  // update user
  updateUser: async (id, data) => {
    return await prisma.user.update({ where: { id }, data });
  },

  // delete user
  deleteUser: async (id) => {
    return await prisma.user.delete({ where: { id } });
  },
};
