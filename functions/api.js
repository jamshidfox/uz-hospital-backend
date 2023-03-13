const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const serverless = require('serverless-http');

//Cors
app.use(cors());

//Route
const User = require('../route/User');
const port = 7777;

app.use(bodyParser.json());
app.use(User);

const handler = serverless(app);

module.exports.handler = async (event, context) => {
  const result = await handler(event, context);
  return result;
};
