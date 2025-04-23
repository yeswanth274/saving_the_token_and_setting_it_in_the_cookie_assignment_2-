const jwt = require('jsonwebtoken');
const secret = 'kalvianSecret';

const authenticateToken = (req, res, next) => {
  const token = req.cookies.authToken; // Check the cookies for the access token

  if (!token) {
    return res.status(401).send('No token found in cookies!'); // Token missing error
  }

  jwt.verify(token, secret, (err, decoded) => {
    if (err) {
      return res.status(403).send('Invalid or expired token'); // Token verification error
    }
    req.user = decoded; // Attach decoded user data to the request
    next(); // Continue to the next route handler
  });
};

module.exports = authenticateToken;