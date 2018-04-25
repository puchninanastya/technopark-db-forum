var express = require('express');

import forumsController from '../controllers/forums-controller';

var forumsRouter = express.Router();

forumsRouter.post('/create', forumsController.createForum);
forumsRouter.get('/:slug/details', forumsController.getForumDetails);

export default forumsRouter;