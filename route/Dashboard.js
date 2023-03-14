const express = require('express');
const route = express.Router();
const { configUrl } = require('../configs/config');

route.get('/overallStatistics', (req, res) => {
  res.send('Good');
});

module.exports = route;
