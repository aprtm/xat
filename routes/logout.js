"use strict";
exports.__esModule = true;
var express = require("express");
var router = express.Router();
router.get('/', function (req, res, next) {
    req.logout();
    console.log('Logged out');
    return res.send('no user');
});
exports["default"] = router;
