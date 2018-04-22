var express = require('express');

var indexRouter = express.Router();

/* GET index */
indexRouter.get('/', function(req, res) {
    res.send('Welcome to Forum API!');
});

export default indexRouter;