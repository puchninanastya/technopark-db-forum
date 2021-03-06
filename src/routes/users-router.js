var express = require('express');

import usersController from '../controllers/users-controller';

var usersRouter = express.Router();

usersRouter.get('/:nickname/profile', usersController.getUser);
usersRouter.post('/:nickname/profile', usersController.updateUser);
usersRouter.post('/:nickname/create', usersController.createUser);

export default usersRouter;