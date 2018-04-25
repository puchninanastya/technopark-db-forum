var express = require('express');

import threadsController from '../controllers/threads-controller';

var threadsRouter = express.Router();

// threadsRouter.post('/create', threadsController.createForum);
// threadsRouter.get('/:slug/details', threadsController.getForumDetails);

export default threadsRouter;