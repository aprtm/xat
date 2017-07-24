"use strict";
exports.__esModule = true;
var express = require("express");
var mdbStitch = require("mongodb-stitch");
// Get the client for the xat-mxymz app
var stitchClient = new mdbStitch.StitchClient('xat-mxymz');
// get database instance from of a mongodb object with the XAT name
var db = stitchClient.service('mongodb', 'mongodb-atlas').db('XAT');
var router = express.Router();
//+++++++++++++++++HANDLE POST TO API/LOGIN+++++++++++++++++++++++++++++++
router.get('/:id', function routeHandler(req, res, next) {
    console.log('Fetching user...', req.params.id);
    if (req.isAuthenticated) {
        stitchClient.login()
            .then(function onFulfilled() {
            var Users = db.collection('Users');
            console.log('Connected to DB.');
            return Users.find({ _id: { $oid: req.params.id } });
        }, function onRejected(reason) {
            console.log('Error connecting to DB.');
            return res.sendStatus(reason);
        })
            .then(function onFulfilled(users) {
            if (users.length < 1) {
                console.log('No users match that id');
                return res.sendStatus(404);
            }
            if (users.length > 1) {
                console.log('Conflict');
                return res.sendStatus(409).send('ID conflict');
            }
            console.log('Found and retrieved user', users[0]);
            return res.send({
                _id: users[0]._id,
                username: users[0].username,
                email: users[0].email,
                friends: users[0].friends,
                conversations: users[0].conversations
            });
        }, function onRejected(reason) {
            console.log('Error ');
            return res.send(reason);
        })["catch"](function (err) { return err; });
    }
    else {
        return res.send(403);
    }
});
exports["default"] = router;
