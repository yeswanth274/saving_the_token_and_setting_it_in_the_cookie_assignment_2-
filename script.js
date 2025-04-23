const jwt = require('jsonwebtoken');

const encrypt = (payload, secret) => {
  // Create the JWT with the specified payload, secret, and expiry time (60 seconds)
  const token = jwt.sign(payload, secret, { expiresIn: '60s' });
  return token;
};

module.exports = encrypt;