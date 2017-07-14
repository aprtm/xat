"use strict";
exports.__esModule = true;
var express = require("express");
var mdbStitch = require("mongodb-stitch");
var router = express.Router();
// type definitions not yet available in definitely typed. Using Any as type.
// Get the client for the xat-mxymz app
var stitchClient = new mdbStitch.StitchClient('xat-mxymz');
// get database instance from of a mongodb object with the XAT name
var db = stitchClient.service('mongodb', 'mongodb-atlas').db('XAT');
/* POST new user. */
router.post('/', function (req, res, next) {
    // login anonymously (no arguments) to the client.
    stitchClient.login().then(function fulfill() {
        // get a collection and test its api
        var Users = db.collection('Users');
        //TODO: Check that the username and email are not already in use
        return Users.insertOne({
            owner_id: stitchClient.authedId(),
            username: req.body.username,
            password: req.body.password,
            email: req.body.email
        });
    }, function reject(reason) {
        console.log(reason);
        return reason;
    })
        .then(function fulfill() {
        res.sendStatus(200);
        res.end();
    }, function reject(reason) {
        console.log(reason);
        res.sendStatus(500);
        res.end();
    });
});
/* GET a username */
router.get('/username/:username', function (req, res, next) {
    // login anonymously (no arguments) to the client.
    stitchClient.login().then(function fulfill() {
        // get a collection and test its api
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
/* GET an email */
router.get('/email/:email', function (req, res, next) {
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
