const express = require('express');
const { StatusCodes } = require('http-status-codes');
const CustomError = require('../errors');
const {
  getAllUsers,
  login,
  register,
  logout,
} = require('../controllers/userController');
const fileUplaod = require('../middleware/file-upload');

const router = express.Router();

// Get all users
router.route('/').get(getAllUsers);

// Login User
router.route('/login').post(login);

// Register User
router.route('/signup').post(fileUplaod.single('image'), register);

// Logout user
router.route('/logout').get(logout);

module.exports = router;
