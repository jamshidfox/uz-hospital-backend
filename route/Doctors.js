const express = require('express');
const route = express.Router();
const { configUrl } = require('../configs/config');
const Joi = require('joi');
const mongoose = require('mongoose');
const { uploadImageToS3 } = require('./helpers/s3');
//Multer middleware

const multer = require('multer');
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/doctors'); // Uploads folder
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname); // Unique filename
  },
});
const upload = multer({ storage: storage });

//Routing

route.post('/addNew', upload.single('image'), async (req, res) => {
  const { name, surname, status, email, password } = req.body;
  const file = req.file;

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
  const image = await uploadImageToS3(file);

  const doctorInfo = {
    name,
    surname,
    email,
    password,
    status,
    image: image.Location,
  };
  if (error) {
    return res.status(400).send(error.details[0].message);
  }
  // Adding To DataBase
  mongoose.connect(configUrl, async (err, db) => {
    if (err) {
      console.log(`Error accuried: ${err}`);
      res.send(`Error accuried: ${err}`);
    } else {
      await db.collection('doctors').insertOne(doctorInfo);
      res.send('Successefully added');
      mongoose.disconnect();
    }
  });
});
route.get('/getDoctors', (req, res) => {
  mongoose.connect(configUrl, async (err, db) => {
    if (err) {
      console.log(`Error accuried: ${err}`);
      res.send(`Error accuried: ${err}`);
    } else {
      await db
        .collection('doctors')
        .find()
        .toArray((err, result) => {
          return res.send(result);
        });
    }
  });
});
module.exports = route;
