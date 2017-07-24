"use strict";
exports.__esModule = true;
var express = require("express");
var router = express.Router();
router.post('/', function done(req, res, next) {
    req.logout();
    console.log('Logged out');
    return res.send('no user');
});
exports["default"] = router;
