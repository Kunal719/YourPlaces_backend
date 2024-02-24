const CustomError = require('../errors');
const { isVerifiedToken } = require('../util');

const authenticateUser = async (req, res, next) => {
  const token = req.signedCookies.token; // because we named as token in jwt.js when we attach to res to cookie
  if (!token) {
    throw new CustomError.UnauthenticatedError(
      'Authentication Invalid, no token found'
    );
  }

  try {
    const { name, userID } = isVerifiedToken(token); // returns payload like createUserToken.js
    req.user = { name, userID };
  } catch (error) {
    throw new CustomError.UnauthenticatedError('Authentication Invalid');
  }

  next();
};

module.exports = { authenticateUser };
