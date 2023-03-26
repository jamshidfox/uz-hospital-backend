const express = require('express');
const route = express.Router();
const jwt = require('jsonwebtoken');

route.get('/check_token/:id', async (req, res) => {
  const token = req.params.id;
  if (!token) {
    return res.status(401).json({ message: 'Authentication token is missing' });
  }
  jwt.verify(token, 'hello', (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid token' });
    }
    res.send(user);
  });
});
module.exports = route;
