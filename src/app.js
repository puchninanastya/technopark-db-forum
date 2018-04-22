var express = require('express');
var logger = require('morgan');

import indexRouter from './routes/index-router';
import usersRouter from './routes/users-router';

var app = express();

app.use(logger('dev'));
app.use(express.json());

app.use('/api/', indexRouter);
app.use('/api/user', usersRouter);

const port = process.env.PORT || 5000;
app.listen(port, () => console.log('Forum API server is running on port: ', port));
