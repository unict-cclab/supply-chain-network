const express = require('express');
const path = require('path');
const cors = require("cors");
const mongoose = require('mongoose');
const utils = require('./utils');

// Import base routes
const indexRouter = require('./routes/index');
const userRouter = require('./routes/users');

mongoose.set('useCreateIndex', true);
mongoose.connect('mongodb://' + process.env.DB_USERNAME + ':' + process.env.DB_PASSWORD + '@' + process.env.DB_HOST + ':' + process.env.DB_PORT + '/' + process.env.DB_NAME);

const db = mongoose.connection;
db.on('error', function() {
  console.error('Connection error!');
  process.exit(1);
});
db.once('open', function() {
  console.log('DB connection Ready');
});

// Init express app
const app = express();

// Enable CORS
app.use(cors());

// Body Parser Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/', indexRouter);
app.use('/users', userRouter);

// Catch 404 errors
app.use(function(req, res, next) {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// Error handler
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.json({
    message: err.message,
    error: err
  });
});

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
  //Init db
  utils.addAdminUserToDb(process.env.ADMIN_USERNAME, process.env.ADMIN_PASSWORD);
});