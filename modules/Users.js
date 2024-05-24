// models/User.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Create Schema
const UserSchema = new Schema({
  name: { //id
    type: String,
    required: true
  },
  email: { // e-mail
    type: String,
    required: true,
    unique: true
  },
  password: { // password
    type: String,
    required: true
  },
  birth: { //birth day
    type: Date,
    required: true
  },
  nickname: { // nickname
    type: String,
    required: true
  },
  date: { // creation date
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('users', UserSchema);
