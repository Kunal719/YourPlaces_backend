const jwt = require('jsonwebtoken');

const createJWT = (payload) => {
  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: '1h',
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
    expires: new Date(Date.now() + oneHour),
    secure: process.env.NODE_ENV === 'production',
    // secure: true,
    sameSite: 'Strict',
    signed: true,
    domain: 'https://yourplaces-6bee5.web.app',
  });
};

module.exports = { createJWT, isVerifiedToken, attachCookiesToResponse };
