const mongoose = require('mongoose');
const validator = require('validator');

const PlaceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide the name of the place'],
  },
  description: {
    type: String,
    required: [true, 'Please provide the description of the place'],
    minlength: 5,
    validate: {
      validator: function (value) {
        return value.trim().length >= 5;
      },
      message:
        'Description must have at least 5 characters without whitespaces',
    },
  },
  image: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
  },
  creatorId: {
    type: mongoose.Types.ObjectId,
    required: true,
    ref: 'User',
  },
});

module.exports = mongoose.model('Place', PlaceSchema);
