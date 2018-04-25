var express = require('express');

import threadsController from '../controllers/threads-controller';

var threadsRouter = express.Router();

threadsRouter.post('/:slug_or_id/create', threadsController.createPost);

export default threadsRouter;