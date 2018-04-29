var express = require('express');

import serviceController from '../controllers/service-controller';

var serviceRouter = express.Router();

serviceRouter.get('/status', serviceController.getServiceStatus);
serviceRouter.post('/clear', serviceController.clearAll);

export default serviceRouter;