const { StatusCodes } = require('http-status-codes');
const CustomError = require('../errors');
const User = require('../models/User');
const { attachCookiesToResponse, createUserToken } = require('../util');

const getAllUsers = async (req, res, next) => {
  const users = await User.find().select('-password');
  if (!users) {
    throw new CustomError.NotFoundError('There are no users currently');
  }

  res
    .status(StatusCodes.OK)
    .json({ users: users.map((user) => user.toObject({ getters: true })) });
};

const register = async (req, res, next) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    throw new CustomError.BadRequestError(
      'Please provide all details to register'
    );
  }

  // If email already exists
  const existingEmail = await User.findOne({ email });
  if (existingEmail) {
    throw new CustomError.BadRequestError('Email already exists');
  }

  const newUser = await User.create({
    name,
    email,
    password,
    image: req.file.path,
    places: [],
  });

  // Setup JWT
  const tokenUser = createUserToken(newUser);
  attachCookiesToResponse(res, tokenUser);

  // console.log(req.signedCookies);

  res.status(StatusCodes.CREATED).json({ user: tokenUser });
};

const login = async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new CustomError.BadRequestError(
      'Please provide your email and password to login'
    );
  }

  const user = await User.findOne({ email });
  if (!user) {
    throw new CustomError.UnauthenticatedError('Incorrect email/password');
  }

  // Check Password
  const checkPassword = await user.checkPassword(password);
  if (!checkPassword) {
    throw new CustomError.UnauthenticatedError('Incorrect email/password');
  }

  // If everything is fine
  const tokenUser = createUserToken(user);
  attachCookiesToResponse(res, tokenUser);

  res.status(StatusCodes.OK).json({ user: tokenUser });
};

const logout = async (req, res, next) => {
  res.cookie('token', null, {
    httpOnly: true,
    expires: new Date(Date.now()),
  });

  res.status(StatusCodes.OK).json({ msg: 'Logged out succesfully' });
};

module.exports = { getAllUsers, register, login, logout };
