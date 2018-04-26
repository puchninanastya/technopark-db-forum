var express = require('express');

import threadsController from '../controllers/threads-controller';

var threadsRouter = express.Router();

threadsRouter.post('/:slug_or_id/create', threadsController.createPostsForThread);

export default threadsRouter;