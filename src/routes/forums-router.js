var express = require('express');

import forumsController from '../controllers/forums-controller';

var forumsRouter = express.Router();

forumsRouter.post('/create', forumsController.createForum);

export default forumsRouter;