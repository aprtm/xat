"use strict";
exports.__esModule = true;
var express = require("express");
var mdbStitch = require("mongodb-stitch");
var passport = require("passport");
var router = express.Router();
// type definitions not yet available in definitely typed. Using Any as type.
// Get the client for the xat-mxymz app
var stitchClient = new mdbStitch.StitchClient('xat-mxymz');
// get database instance from of a mongodb object with the XAT name
var db = stitchClient.service('mongodb', 'mongodb-atlas').db('XAT');
//+++++++++++++++++ HANDLE POST TO API/SIGNUP +++++++++++++++++++++++++++++++
//+++++++++++++++++ REQUIRES AUTHENTICATION +++++++++++++++++++++++++++++++
router.post('/', function onPost(req, res, next) {
    passport.authenticate('signup-local', function done(err, user, info) {
        if (err) {
            console.log('Error with signup-local strategy');
            return next(err);
        }
        if (!user) {
            console.log('Credentials conflict with existing data.');
            return res.status(409).send(info.message);
        }
        // login anonymously (no arguments) to the client.
        stitchClient.login()
            .then(function fulfill() {
            // get a collection and test its api
            var Users = db.collection('Users');
            return Users.insertOne({
                username: user.username,
                password: user.hash,
                pictureUrl: 'http://lorempixel.com/45/45/people/',
                email: req.body.email,
                friends: [],
                conversations: [],
                requests: []
            });
        }, function reject(reason) {
            console.log(reason);
            return next(reason);
        })
            .then(function fulfill(newUser) {
            console.log('Successfully registered new user.', newUser);
            return res.send(newUser.insertedIds);
        }, function reject(reason) {
            console.log(reason);
            return res.send(reason);
        });
    })(req, res, next);
});
//+++++++++++++++++ CLIENT VALIDATION ENDPOINTS +++++++++++++++++++++++++++++++
//+++++++++++++++++ HANDLE GET FROM API/SIGNUP/USERNAME +++++++++++++++++++++++++++++++
router.get('/username/:username', function onGet(req, res, next) {
    // login anonymously (no arguments) to the client.
    stitchClient.login().then(function fulfill() {
        var Users = db.collection('Users');
        // console.log( 'gets here! params:', req.params.username);
        var u = Users.find({ username: req.params.username });
        return u;
    }, function reject(reason) {
        console.log(reason);
        return reason;
    })
        .then(function fulfill(user) {
        var exists = user.length;
        res.send(!!exists);
        res.end();
    }, function reject(reason) {
        console.log(reason);
        res.sendStatus(500);
        res.end();
    })["catch"](function (err) { return console.log(err); });
    console.log('Got a request!');
});
//+++++++++++++++++ HANDLE GET FROM API/SIGNUP/USERNAME +++++++++++++++++++++++++++++++
router.get('/email/:email', function onGet(req, res, next) {
    // login anonymously (no arguments) to the client.
    stitchClient.login().then(function fulfill() {
        // get a collection and test its api
        var Users = db.collection('Users');
        // console.log( 'gets here! params:', req.params.username);
        var u = Users.find({ email: req.params.email });
        return u;
    }, function reject(reason) {
        console.log(reason);
        return reason;
    })
        .then(function fulfill(user) {
        var exists = user.length;
        res.send(!!exists);
        res.end();
    }, function reject(reason) {
        console.log(reason);
        res.sendStatus(500);
        res.end();
    })["catch"](function (err) { return console.log(err); });
    console.log('Got a request!');
});
exports["default"] = router;
