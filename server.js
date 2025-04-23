const express = require('express');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const encrypt = require('./script'); // Import the encrypt function
const authenticateToken = require('./middleware'); // Import the authentication middleware

const app = express();
app.use(cookieParser());

// Secret key for signing the JWT
const secret = 'kalvianSecret';
const refreshSecret = 'kalvianRefreshSecret';

// Root route to check if the server is running
app.get('/', (req, res) => {
  res.send('Welcome to the Kalvian JWT Lab!');
});

// Login route where JWT and refresh token are created and set in a cookie
app.get('/login', (req, res) => {
  const payload = { userId: 123, name: 'Kalvian Cookie' };
  
  // Generate access token (expires in 1 minute)
  const accessToken = encrypt(payload, secret);

  // Generate refresh token (expires in 1 day)
  const refreshToken = jwt.sign(payload, refreshSecret, { expiresIn: '1d' });

  // Set the access token and refresh token in cookies
  res.cookie('authToken', accessToken, { httpOnly: true, maxAge: 60000 }); // Access token expires in 1 minute
  res.cookie('refreshToken', refreshToken, { httpOnly: true, maxAge: 86400000 }); // Refresh token expires in 1 day
  
  res.send('Tokens are set in cookies!');
});

// Route to verify the access token from the cookie
app.get('/verify', (req, res) => {
  const token = req.cookies.authToken;

  if (!token) {
    return res.status(401).send('No token found in cookies!');
  }

  try {
    const decoded = jwt.verify(token, secret);
    res.send('Token is valid! Decoded payload: ' + JSON.stringify(decoded));
  } catch (err) {
    // If token is expired, check the refresh token
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).send('Both tokens are expired. Please log in again.');
    }

    // Verify the refresh token and issue a new access token
    try {
      const decodedRefresh = jwt.verify(refreshToken, refreshSecret);
      const newAccessToken = encrypt(decodedRefresh, secret);
      res.cookie('authToken', newAccessToken, { httpOnly: true, maxAge: 60000 }); // Set new access token

      res.send('Access token expired, but a new one was issued. Decoded payload: ' + JSON.stringify(decodedRefresh));
    } catch (err) {
      return res.status(403).send('Refresh token is invalid or expired. Please log in again.');
    }
  }
});

// Route to log the user out by clearing the tokens
app.get('/logout', (req, res) => {
  res.clearCookie('authToken');
  res.clearCookie('refreshToken');
  res.send('You have been logged out!');
});

// Protect the profile route with the authentication middleware
app.get('/profile', authenticateToken, (req, res) => {
  res.send(`Hello, ${req.user.name}! Your profile is protected.`);
});

// Start the Express server
app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});