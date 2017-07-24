"use strict";
exports.__esModule = true;
var mdbStitch = require("mongodb-stitch");
var passport = require("passport");
var passportLocal = require("passport-local");
var login_local_1 = require("./passport-strategies/login-local");
var signup_local_1 = require("./passport-strategies/signup-local");
var login_localDev_1 = require("./passport-strategies/login-localDev");
var signup_localDev_1 = require("./passport-strategies/signup-localDev");
function setup() {
    //++++++++++++++ SET UP SERIALIZATION ++++++++++++++++++++++
    passport.serializeUser(serialize);
    passport.deserializeUser(deserialize);
    var LocalStrategy = passportLocal.Strategy;
    //++++++++++++++ CONFIGURE LOGIN AUTHENTICATION ++++++++++++++++++++++
    if (process.env.OFFLINE) {
        passport.use('login-local', new LocalStrategy(login_localDev_1.loginVerifyDev));
    }
    else {
        passport.use('login-local', new LocalStrategy(login_local_1.loginVerify));
    }
    //++++++++++++++ CONFIGURE SIGNUP AUTHENTICATION ++++++++++++++++++++++
    if (process.env.OFFLINE) {
        passport.use('signup-local', new LocalStrategy({ passReqToCallback: true }, signup_localDev_1.signupVerifyDev));
    }
    else {
        passport.use('signup-local', new LocalStrategy({ passReqToCallback: true }, signup_local_1.signupVerify));
    }
    // //++++++++++++++ CONFIGURE CONVERSATIONS AUTHENTICATION ++++++++++++++++++++++
    // passport.use('conversation-local', new LocalStrategy({ passReqToCallback:true }, conversationVerify ) );
}
exports.setup = setup;
function serialize(user, connectCb) {
    console.log('User serialized');
    connectCb(null, user._id);
}
// Get the client for the xat-mxymz app
var stitchClient = new mdbStitch.StitchClient('xat-mxymz');
// get database instance from of a mongodb object with the XAT name
var db = stitchClient.service('mongodb', 'mongodb-atlas').db('XAT');
function deserialize(id, connectCb) {
    stitchClient.login()
        .then(function onFulfilled() {
        console.log('Successful deserialization');
        return db.collection('Users').find({ _id: id });
    }, function onRejected(reason) {
        console.log('Rejected deserialization.');
        connectCb(reason);
    })
        .then(function (users) {
        connectCb(null, users[0]);
    }, function (reason) {
        console.log('DB Find error');
        connectCb(reason);
    })["catch"](function (err) { console.log('Error deserializing.'); return err; });
}
