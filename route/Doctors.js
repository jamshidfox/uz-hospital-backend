const express = require('express');
const route = express.Router();
const { configUrl } = require('../configs/config');
const Joi = require('joi');
const mongoose = require('mongoose');

route.post('/addNew', async (req, res) => {
  const { name, surname, status, email, password } = req.body;

  //Validation
  const schema = Joi.object({
    name,
    surname,
    status,
    email: Joi.string().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } }),
    password: Joi.string()
      .pattern(new RegExp(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/))
      .required(),
  });
  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).send(error.details[0].message);
  }

  // Adding To DataBase
  mongoose.connect(configUrl, async (err, db) => {
    if (err) {
      console.log(`Error accuried: ${err}`);
      res.send(`Error accuried: ${err}`);
    } else {
      await db.collection('doctors').insertOne({
        name,
        surname,
        status,
        email,
        password,
      });
      res.send('Successefully added');
      mongoose.disconnect();
    }
  });
});
module.exports = route;
