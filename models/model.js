const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: String,
  password: String,
});

const User = connection.model('User', userSchema);

module.exports = User;
