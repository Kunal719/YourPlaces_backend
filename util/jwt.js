const jwt = require('jsonwebtoken');

const createJWT = (payload) => {
  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_LIFETIME,
  });

  return token;
};

const isVerifiedToken = (token) => jwt.verify(token, process.env.JWT_SECRET);

const attachCookiesToResponse = (res, payload) => {
  const token = createJWT(payload);
  // const oneDay = 1000 * 60 * 60 * 24;

  const oneHour = 1000 * 60 * 60;

  res.cookie('token', token, {
    httpOnly: true,
    expiresIn: new Date(Date.now() + oneHour),
    secure: process.env.NODE_ENV === 'production',
    // secure: true,
    sameSite: 'Strict',
    signed: true,
  });
};

module.exports = { createJWT, isVerifiedToken, attachCookiesToResponse };
