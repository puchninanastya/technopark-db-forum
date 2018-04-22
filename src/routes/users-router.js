var express = require('express');

import usersController from '../controllers/user-controller';

var usersRouter = express.Router();

usersRouter.get('/:nickname/profile', usersController.getUser);
usersRouter.post('/:nickname/create', usersController.createUser);

export default usersRouter;