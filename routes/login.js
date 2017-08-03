"use strict";
exports.__esModule = true;
var express = require("express");
var passport = require("passport");
// // Get the client for the xat-mxymz app
// const stitchClient:any = new mdbStitch.StitchClient( 'xat-mxymz' );
// // get database instance from of a mongodb object with the XAT name
// const db = stitchClient.service('mongodb', 'mongodb-atlas').db('XAT');
var router = express.Router();
//+++++++++++++++++HANDLE POST TO API/LOGIN+++++++++++++++++++++++++++++++
router.post('/', function routeHandler(req, res, next) {
    passport.authenticate('login-local', function done(err, user, info) {
        if (err) {
            console.log('Error with login-local strategy');
            return next(err);
        }
        if (!user) {
            console.log('Failed to authenticate. Could not find user.');
            return res.status(401).send(info.message);
        }
        req.logIn(user, function (err) {
            if (err) {
                console.log('Error while logging in.');
                return next(err);
            }
            console.log('User authenticated and correctly logged in? -', req.isAuthenticated().valueOf().toString().toUpperCase());
            return res.send({
                _id: user._id,
                username: user.username,
                email: user.email,
                friends: user.friends,
                conversations: user.conversations,
                requests: user.requests
            });
        });
    })(req, res, next);
});
exports["default"] = router;
