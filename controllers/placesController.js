const { StatusCodes } = require('http-status-codes');
const CustomError = require('../errors');
const getCoordsForAddress = require('../util/location');
const Place = require('../models/Place');
const User = require('../models/User');
const { checkPermissions } = require('../util');
const fs = require('fs');

const getPlaceById = async (req, res, next) => {
  const placeId = req.params.pid;

  const place = await Place.findOne({ _id: placeId });

  if (!place) {
    throw new CustomError.NotFoundError(`No place with id: ${placeId} exists`);
  }

  res.status(StatusCodes.OK).json({ place: place.toObject({ getters: true }) });
};

const getUserPlaces = async (req, res, next) => {
  const userId = req.params.uid;

  const userPlaces = await Place.find({ creatorId: userId });

  if (!userPlaces || userPlaces.length === 0) {
    throw new CustomError.NotFoundError(
      `There are no places for the user with id: ${userId}`
    );
  }

  res.status(StatusCodes.OK).json({
    userPlaces: userPlaces.map((place) => place.toObject({ getters: true })),
  });
};

const createPlace = async (req, res, next) => {
  const { title, description, address } = req.body;

  if (!title || !description || !address) {
    throw new CustomError.BadRequestError(
      'Invalid inputs, please provide all details to create a place'
    );
  }

  let coordinates;
  try {
    coordinates = await getCoordsForAddress(address);
  } catch (error) {
    return next(error);
  }

  const createdPlace = await Place.create({
    title,
    description,
    address,
    location: coordinates,
    image: req.file.path,
    creatorId: req.user.userID,
  });

  // Push the place created by user to it's 'places' value in User Model.
  const user = await User.findOne({ _id: req.user.userID });

  if (createdPlace) {
    user.places.push(createdPlace);
    await user.save();
  }

  res.status(StatusCodes.CREATED).json({ createdPlace });
};

const updatePlace = async (req, res, next) => {
  const { title, description } = req.body;

  if (!title || !description) {
    throw new CustomError.BadRequestError(
      'Please provide title and description to update place'
    );
  }
  const placeId = req.params.pid;

  const toUpdatePlace = await Place.findOne({ _id: placeId });

  if (!toUpdatePlace) {
    throw new CustomError.NotFoundError(`No place with id: ${placeId}`);
  }

  checkPermissions(req.user, toUpdatePlace.creatorId);

  toUpdatePlace.title = title;
  toUpdatePlace.description = description;

  await toUpdatePlace.save();

  res
    .status(StatusCodes.OK)
    .json({ updatedPlace: toUpdatePlace.toObject({ getters: true }) });
};

const deletePlace = async (req, res, next) => {
  const placeId = req.params.pid;
  const toDeletePlace = await Place.findOne({ _id: placeId }).populate({
    path: 'creatorId',
    select: '_id places',
  });

  if (!toDeletePlace) {
    throw new CustomError.NotFoundError(`No place with id: ${placeId}`);
  }

  checkPermissions(req.user, toDeletePlace.creatorId._id);

  await Place.deleteOne({ _id: placeId });

  const imagePath = toDeletePlace.image;

  // Remove place from user's profile too, from populate method user document is attached on the property
  // creatorID in toDeletePlace
  toDeletePlace.creatorId.places.pull(toDeletePlace);
  await toDeletePlace.creatorId.save();

  fs.unlink(imagePath, (err) => {
    console.log(err);
  });

  res.status(StatusCodes.OK).json({ msg: 'Deleted place succesfully' });
};

module.exports = {
  getUserPlaces,
  getPlaceById,
  createPlace,
  updatePlace,
  deletePlace,
};
