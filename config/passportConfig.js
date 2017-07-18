"use strict";
exports.__esModule = true;
var mdbStitch = require("mongodb-stitch");
var passport = require("passport");
var passportLocal = require("passport-local");
var bcrypt = require("bcrypt");
var LocalStrategy = passportLocal.Strategy;
// Get the client for the xat-mxymz app
var stitchClient = new mdbStitch.StitchClient('xat-mxymz');
// get database instance from of a mongodb object with the XAT name
var db = stitchClient.service('mongodb', 'mongodb-atlas').db('XAT');
function passportInit() {
    //++++++++++++++SET UP SERIALIZATION++++++++++++++++++++++
    passport.serializeUser(function (user, connectCb) {
        console.log('User serialized');
        connectCb(null, user._id);
    });
    passport.deserializeUser(function (id, connectCb) {
        stitchClient.login().then(function onFulfilled() {
            console.log('Successful deserialization');
            connectCb(null, db.collection('Users').find({ _id: id }));
        }, function onRejected(err) {
            console.log('Rejected deserialization');
            connectCb(err);
        })["catch"](function (err) { console.log('Deserializing error'); return err; });
    });
    //++++++++++++++CONFIGURE LOGIN AUTHENTICATION++++++++++++++++++++++
    passport.use('login-local', new LocalStrategy(function verify(username, password, done) {
        stitchClient.login()
            .then(function onFulfilled(response) {
            console.log('Database client connection successful');
            //after logging in to the database get the Users collection and find the username
            var Users = db.collection('Users');
            var findUser = Users.find({ $or: [{ username: username }, { email: username }] });
            return findUser;
        }, function onRejected(reason) {
            console.log('Database client connection rejected');
            return done(reason);
        })
            .then(function onFulfilled(users) {
            console.log('Users that match credentials: ', users.length);
            if (users.length !== 1) {
                console.log('Username not in database.');
                return done(null, false, { message: 'Could not find user.' });
            }
            bcrypt.compare(password, users[0].password, function (err, authenticated) {
                if (err) {
                    console.log('Failed password verification.:', err);
                    return done(err);
                }
                if (authenticated) {
                    console.log('All good. Logged in.');
                    return done(null, users[0]);
                }
                else {
                    console.log('Password check went bad.');
                    return done(null, false, { message: 'Wrong password.' });
                }
            });
        }, function onRejected(reason) {
            console.log('Rejection while fetching user data.');
            return done(reason);
        })["catch"](function (err) { console.log('Error while handling login request. '); return done(err); });
    }));
    //++++++++++++++CONFIGURE SIGNUP AUTHENTICATION++++++++++++++++++++++
    passport.use('signup-local', new LocalStrategy({ passReqToCallback: true }, function verify(req, username, password, done) {
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
    }));
}
exports["default"] = passportInit;
