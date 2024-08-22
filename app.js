var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
require('dotenv').config();
require('dotenv').config();
console.log('MongoDB URI:', process.env.MONGO_URI);
var logger = require('morgan');
const cors = require('cors')

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/product');

var app = express();

app.use(cors({
    origin: '*'
}));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

module.exports = app;