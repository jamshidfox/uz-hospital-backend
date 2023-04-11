const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const serverless = require('serverless-http');
const { authorize } = require('../route/functions');
const WebSocket = require('ws');
const port = 9999;
//Cors
app.use(cors());
//Socket
const server = app.listen(port, () => {
  console.log('Server started');
});

const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
  console.log('A new user connected');

  ws.on('message', (message) => {
    console.log(`Received message: ${message}`);

    // Echo the message back to the client
    ws.send(`You said: ${message}`);
  });
});

server.on('upgrade', (request, socket, head) => {
  wss.handleUpgrade(request, socket, head, (ws) => {
    wss.emit('connection', ws, request);
  });
});

//
//Route
const User = require('../route/User');
const Doctors = require('../route/Doctors');
const Dashboard = require('../route/Dashboard');
const Appointment = require('../route/Appointments');
const Main = require('../route/Main');

app.use(bodyParser.json());
app.use('/user', User);
app.use('/main', Main);
// app.use(authorize);
app.use('/dashboard', Dashboard);
app.use('/doctors', Doctors);
app.use('/appointments', Appointment);
const handler = serverless(app);

module.exports.handler = async (event, context) => {
  const result = await handler(event, context);
  return result;
};
