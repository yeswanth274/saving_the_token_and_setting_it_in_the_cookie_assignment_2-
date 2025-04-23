const encrypt = require('./script');

const payload = {
  userId: 101,
  name: 'Kalvian Hero'
};

const secret = 'kalvianSecret';

const token = encrypt(payload, secret);
console.log('Generated JWT:', token);