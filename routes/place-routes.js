const express = require('express');
const router = express.Router();

const {
  getUserPlaces,
  getPlaceById,
  createPlace,
  updatePlace,
  deletePlace,
} = require('../controllers/placesController');
const { authenticateUser } = require('../middleware/authentication');

const fileUplaod = require('../middleware/file-upload');

// Get place, update, delete by Id
router
  .route('/:pid')
  .get(getPlaceById)
  .delete(authenticateUser, deletePlace)
  .patch(authenticateUser, updatePlace);

// Get places created by a specific user
router.route('/user/:uid').get(getUserPlaces);

// Create Place
router
  .route('/')
  .post(authenticateUser, fileUplaod.single('image'), createPlace);

module.exports = router;
