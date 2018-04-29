var express = require('express');
var logger = require('morgan');

import indexRouter from './routes/index-router';
import usersRouter from './routes/users-router';
import forumsRouter from './routes/forums-router';
import threadsRouter from './routes/threads-router';
import postsRouter from './routes/posts-router';
import serviceRouter from './routes/service-router';

var app = express();

app.use(logger('dev'));
app.use(express.json());

app.use('/api/', indexRouter);
app.use('/api/user', usersRouter);
app.use('/api/forum', forumsRouter);
app.use('/api/thread', threadsRouter);
app.use('/api/post', postsRouter);
app.use('/api/service', serviceRouter);

const port = process.env.PORT || 5000;
app.listen(port, () => console.log('Forum API server is running on port: ', port));
