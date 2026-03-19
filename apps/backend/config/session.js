const session = require('express-session');

const IN_PROD = process.env.NODE_ENV === 'production';

const sessionConfig = {
  name: 'edutech.sid',
  secret: process.env.SESSION_SECRET || 'changeme',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
    secure: IN_PROD,
    maxAge: 1000 * 60 * 60 * 2 // 2 horas
  }
};

module.exports = { sessionConfig };
