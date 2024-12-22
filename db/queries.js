const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const getAllUsers = async function () {
  return await prisma.user.findMany();
};

const getUserById = async function (id) {
  return await prisma.user.findUnique({ where: { id } });
};

const getUserByUsername = async function (username) {
  return await prisma.user.findUnique({ where: { username } });
};

const getUserByEmail = async function (email) {
  return await prisma.user.findUnique({ where: { email } });
};

const createUser = async function (data) {
  return await prisma.user.create({ data });
};

const updateUser = async function (id, data) {
  return await prisma.user.update({ where: { id }, data });
};

const deleteUser = async function (id) {
  return await prisma.user.delete({ where: { id } });
};

module.exports = {
  prisma,
  createUser,
  updateUser,
  deleteUser,
  getAllUsers,
  getUserById,
  getUserByUsername,
  getUserByEmail,
};
