"use strict";
exports.__esModule = true;
var mdbStitch = require("mongodb-stitch");
var bcrypt = require("bcrypt");
// Get the client for the xat-mxymz app
var stitchClient = new mdbStitch.StitchClient('xat-mxymz');
// get database instance from of a mongodb object with the XAT name
var db = stitchClient.service('mongodb', 'mongodb-atlas').db('XAT');
function signupVerify(req, username, password, done) {
    var applicant = {
        username: '',
        hash: '',
        email: ''
    };
    stitchClient.login()
        .then(function onFulfilled(response) {
        console.log('Database client connection successful');
        //after logging in to the database get the Users collection and find the username
        var UsersCollection = db.collection('Users');
        var usersFound = UsersCollection.find({ $or: [{ username: username }, { email: req.body.email }] });
        return usersFound;
    }, function onRejected(reason) {
        console.log('Database client connection rejected');
        return done(reason);
    })
        .then(function onFulfilled(users) {
        console.log('Retrieved user data. Users found:', users.length);
        if (users.length !== 0) {
            if (users[0].username === username) {
                console.log('Username already in use.');
                return done(null, false, { message: 'Username in use.' });
            }
            if (users[0].email === req.body.email) {
                console.log('Email already registered.');
                return done(null, false, { message: 'Email in use.' });
            }
        }
        applicant.username = username;
        applicant.email = req.body.email;
        return bcrypt.hash(password, 10);
    }, function onRejected(reason) {
        console.log('Rejection while fetching user data.');
        return done(reason);
    })
        .then(function onFulfilled(hash) {
        applicant.hash = hash;
        done(null, applicant);
    }, function onRejected(reason) {
        console.log('Rejection while fetching user data.');
        return done(reason);
    })["catch"](function (err) { console.log('Error while handling login request. '); return done(err); });
}
exports.signupVerify = signupVerify;
