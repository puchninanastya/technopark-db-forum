var express = require('express');

import postsController from '../controllers/posts-controller';

var postsRouter = express.Router();

postsRouter.post('/create', postsController.createPost);

export default postsRouter;