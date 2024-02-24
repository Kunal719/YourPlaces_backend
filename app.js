const path = require('path');
require('dotenv').config();
require('express-async-errors');
const express = require('express');

// Logging info
const cookieParser = require('cookie-parser');

// Security Packages
const cors = require('cors');

// Import Middlewares
const errorHandlerMiddleware = require('./middleware/error-handler');
const notFoundMiddleware = require('./middleware/not-found');

// Place Routes
const placeRoutes = require('./routes/place-routes');
const userRoutes = require('./routes/user-routes');

// Connect database
const connectDB = require('./db/connect');

const app = express();

app.use(express.json());

app.use('/uploads/images', express.static(path.join('uploads', 'images')));

app.use(
  cors({
    origin: 'https://yourplaces-6bee5.web.app', // Replace with your actual frontend domain
    credentials: true, // Allow sessions and cookies
  })
);

app.use((req, res, next) => {
  res.setHeader(
    'Access-Control-Allow-Origin',
    'https://yourplaces-6bee5.web.app'
  );
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Credentials', true);
  next();
});

app.use(cookieParser(process.env.JWT_SECRET));

app.use('/api/users/', userRoutes);
app.use('/api/places/', placeRoutes);

// Middlewares
app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const port = 5000;
const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    app.listen(process.env.PORT || 5000, () => {
      console.log(`Server is listening on port ${port}`);
    });
  } catch (error) {
    console.log(error);
  }
};

start();
