var express = require('express');

import postsController from '../controllers/posts-controller';

var postsRouter = express.Router();

postsRouter.get('/:id/details', postsController.getPostDetails);
postsRouter.post('/:id/details', postsController.updatePostDetails);

export default postsRouter;