const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const modelsUser = mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});

modelsUser.plugin(uniqueValidator);

module.exports = mongoose.model('user', modelsUser);