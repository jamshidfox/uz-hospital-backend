const express = require('express');
const route = express.Router();
const mongoose = require('mongoose');
const { ObjectId } = require('mongodb');
const { configUrl } = require('../configs/config');

route.post('/addNew', async (req, res) => {
  const { visit_date, visit_time, visit_doctor, patient_condition, patient_id } = req.body;
  try {
    await mongoose.connect(configUrl, async (err, db) => {
      if (err) {
        console.log(`Error accuried: ${err}`);
        res.send(`Error accuried: ${err}`);
      } else {
        const user = await db.collection('users').findOne({ _id: ObjectId(patient_id) });
        if (!user) {
          return res.status(401).json({ message: 'Invalid credentials' });
        }
        const newAppointment = {
          fullName: `${user.name} ${user.surname}`,
          email: user.email,
          visit_date,
          visit_time,
          visit_doctor,
          patient_condition,
          avatar: user.avatar,
        };
        const appointmentsCheck = await db
          .collection('appointments')
          .findOne({ fullName: `${user.name} ${user.surname}`, visit_date, visit_time });
        if (appointmentsCheck) {
          return res.send(
            `${newAppointment.fullName} you have registered in ${appointmentsCheck.visit_date} earlier`
          );
        }
        await db.collection('appointments').insertOne(newAppointment);
        res.send('successfully added to appointments');
      }
      mongoose.disconnect();
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

route.get('/getAll', async (req, res) => {
  mongoose.connect(configUrl, async (err, db) => {
    if (err) {
      console.log(`Error accuried: ${err}`);
      res.send(`Error accuried: ${err}`);
    } else {
      await db
        .collection('appointments')
        .find()
        .toArray((err, result) => {
          return res.send(result);
        });
    }
  });
});

module.exports = route;
