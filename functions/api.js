const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const serverless = require('serverless-http');
const { authorize } = require('../route/functions');

//Cors
app.use(cors());
//
//Route
const User = require('../route/User');
const Doctors = require('../route/Doctors');
app.use(authorize);
const Dashboard = require('../route/Dashboard');

app.use(bodyParser.json());
app.use('/user', User);
app.use('/dashboard', Dashboard);
app.use('/doctors', Doctors);
const handler = serverless(app);

module.exports.handler = async (event, context) => {
  const result = await handler(event, context);
  return result;
};
