const axios = require('axios');
const { StatusCodes } = require('http-status-codes');
const CustomError = require('../errors');

async function getCoordsForAddress(address) {
  const response = await axios.get(
    `https://us1.locationiq.com/v1/search.php?key=${
      process.env.MAP_API
    }&q=${encodeURIComponent(address)}&format=json`
  );

  const data = response.data[0];

  //   console.log(data);

  if (!data || data.status === 'ZERO_RESULTS') {
    throw new CustomError.BadRequestError(
      'Could not find location for the specified address.'
    );
  }

  const coorLat = data.lat;
  const coorLon = data.lon;
  const coordinates = {
    lat: coorLat,
    lng: coorLon,
  };

  return coordinates;
}

module.exports = getCoordsForAddress;
