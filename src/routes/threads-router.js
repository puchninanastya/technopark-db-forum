var express = require('express');

import threadsController from '../controllers/threads-controller';

var threadsRouter = express.Router();

threadsRouter.post('/:slug_or_id/create', threadsController.createPostsForThread);
threadsRouter.post('/:slug_or_id/vote', threadsController.createOrUpdateVoteForThread);
threadsRouter.get('/:slug_or_id/details', threadsController.getThreadDetails);
threadsRouter.get('/:slug_or_id/posts', threadsController.getThreadPosts);

export default threadsRouter;