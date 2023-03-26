const express = require('express');
const fs = require('fs');
const route = express.Router();
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const Joi = require('joi');
const jwt = require('jsonwebtoken');
const secretKey = 'hello';
const { isEmpty } = require('ramda');
const { configUrl } = require('../configs/config');
const { ObjectId } = require('mongodb');
const { uploadImageToS3 } = require('./helpers/s3');
//Midleware for file body
const multer = require('multer');
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/users'); // Uploads folder
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname); // Unique filename
  },
});
const upload = multer({ storage: storage });

route.post('/register', async (req, res) => {
  const { email, password, name, surname } = req.body;

  //Validation
  const schema = Joi.object({
    email: Joi.string().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } }),
    password: Joi.string()
      .pattern(new RegExp(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/))
      .required(),
    name: Joi.string(),
    surname: Joi.string(),
  });
  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).send(error.details[0].message);
  }

  //Hashing
  const saltRounds = 2;
  bcrypt.hash(password, saltRounds, (err, hash) => {
    if (err) {
      console.log(`Hashing Error: ${err}`);
    } else {
      // Adding To DataBase
      mongoose.connect(configUrl, async (err, db) => {
        if (err) {
          console.log(`Error accuried: ${err}`);
          res.send(`Error accuried: ${err}`);
        } else {
          const user = await db.collection('users').findOne({ email: email });

          if (user) {
            return res.status(400).json({ message: 'email has already been used' });
          }
          await db.collection('users').insertOne({
            email,
            password: hash,
            name,
            surname,
            avatar: null,
          });
          res.send('Successefully added');
          mongoose.disconnect();
        }
      });
    }
  });
});
route.post('/login', async (req, res) => {
  const { email, password } = req.body;

  //Validate
  if (!email || !password) {
    return res.status(400).json({ message: 'Please provide email and password' });
  }

  try {
    mongoose.connect(configUrl, async (err, db) => {
      if (err) {
        console.log(`Error accuried: ${err}`);
        res.send(`Error accuried: ${err}`);
      } else {
        const user = await db.collection('users').findOne({ email });
        if (!user) {
          return res.status(401).json({ message: 'Invalid credentials' });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
          return res.status(400).json({ message: 'Invalid credentials' });
        }
        const token = jwt.sign(user, secretKey, { expiresIn: '1d' });
        res.cookie('token', token, { httpOnly: true });
        return res.send({
          token,
          avatar: user.avatar,
          userName: `${user.name} ${user.surname}`,
          user_id: user._id,
        });
      }
      mongoose.disconnect();
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

route.put('/update/:id', upload.single('avatar'), async (req, res) => {
  const userId = req.params.id;
  const file = req.file;

  const avatar = await uploadImageToS3(file);

  mongoose.connect(configUrl, async (err, db) => {
    if (err) {
      console.log(`Error accuried: ${err}`);
      res.send(`Error accuried: ${err}`);
    } else {
      await db
        .collection('users')
        .updateOne(
          { _id: ObjectId(userId) },
          { $set: { avatar: avatar.Location } },
          (err, result) => {
            if (err) {
              console.error(err);
              res.status(500).send('Error updating Avatar');
            } else {
              console.log(result);
              res.send('Avatar updated successfully');
            }
          }
        );
    }
  });
});
module.exports = route;
