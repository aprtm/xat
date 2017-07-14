"use strict";
exports.__esModule = true;
var express = require("express");
var mdbStitch = require("mongodb-stitch");
var passport = require("passport");
// Get the client for the xat-mxymz app
var stitchClient = new mdbStitch.StitchClient('xat-mxymz');
// get database instance from of a mongodb object with the XAT name
var db = stitchClient.service('mongodb', 'mongodb-atlas').db('XAT');
var router = express.Router();
router.post('/', function (req, res, next) {
    console.log('Authenticating ', req.body);
    //<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
    passport.authenticate('loginStrat', function (err, user, info) {
        if (err)
            return next(err);
        if (!user) {
            console.log('Failed to authenticate.');
            res.status(401).send(info.message);
            res.end();
        }
        else {
            req.logIn(user, function (err) {
                console.log('User authenticated');
                if (err) {
                    console.log('Request');
                    return next(err);
                }
                console.log('Respond with user data');
                res.send(user);
                res.end();
            });
        }
    })(req, res, next);
});
// router.get('/',function(req,res){
//     res.sendStatus(200);
//     res.end();
// });
// router.get('/', passport.authenticate('test'), function(req,res){
//     console.log('Got a GET request to /api/login')
//     res.sendFile( JSON.stringify( {'hey':'it GETs!'} ) );
//     res.end();
// } )
exports["default"] = router;
