"use strict";
exports.__esModule = true;
var express = require("express");
var mdbStitch = require("mongodb-stitch");
// Get the client for the xat-mxymz app
var stitchClient = new mdbStitch.StitchClient('xat-mxymz');
// get database instance from of a mongodb object with the XAT name
var db = stitchClient.service('mongodb', 'mongodb-atlas').db('XAT');
var Users = db.collection('Users');
var Conversations = db.collection('Conversations');
var Messages = db.collection('Messages');
var router = express.Router();
//+++++++++++++++++HANDLE GET TO API/USERS/+++++++++++++++++++++++++++++++
// router.get('/', function routeHandler(req, res, next){
//     console.log( 'Confirm status for...',req.user.username );
//     if( req.isAuthenticated() ){
//         console.log('User',req.user.username,'has an active session');
//         return res.send();
//     }
//     else{
//         console.log('No session is active');
//         return res.send({user:null, active:false});
//     }
// } );
//+++++++++++++++++HANDLE GET TO API/USERS+++++++++++++++++++++++++++++++
router.get('/:id', function routeHandler(req, res, next) {
    console.log('Fetching user...', req.params.id);
    if (req.params.id == 'currentUserSession') {
        var currentUser = req.user ?
            {
                _id: req.user._id,
                username: req.user.username,
                pictureUrl: req.user.pictureUrl,
                email: req.user.email,
                friends: req.user.friends,
                conversations: req.user.conversations,
                requests: req.user.requests,
                lang: req.user.lang
            }
            : null;
        return res.send({
            user: currentUser,
            active: req.isAuthenticated()
        });
    }
    if (req.isAuthenticated()) {
        stitchClient.login()
            .then(function onFulfilled() {
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
            console.log('Found and retrieved user', users[0].username);
            return res.send({
                _id: users[0]._id,
                username: users[0].username,
                email: users[0].email,
                pictureUrl: users[0].pictureUrl,
                friends: users[0].friends,
                conversations: users[0].conversations
            });
        }, function onRejected(reason) {
            console.log('Error ');
            return res.send(reason);
        })["catch"](function (err) { return err; });
    }
    else {
        return res.sendStatus(403);
    }
});
//+++++++++++++++++HANDLE POST TO API/USERS/FRIENDREQUEST+++++++++++++++++++++++++++++++
router.post('/friendRequest', function routeHandler(req, res, next) {
    console.log(req.body.fromContact.name, 'friend request to', req.body.contactNameOrEmail);
    if (req.isAuthenticated()) {
        stitchClient.login()
            .then(function onFulfilled() {
            console.log('looking for', req.body.contactNameOrEmail);
            var upsert = true;
            return Users.updateOne({ $or: [
                    { username: req.body.contactNameOrEmail },
                    { email: req.body.contactNameOrEmail }
                ] }, {
                $push: { requests: req.body.fromContact }
            });
        }, function onRejected(reason) {
            console.log('Login failed', reason);
            return res.sendStatus(500);
        })
            .then(function onFulfilled(updatedUsers) {
            if (updatedUsers.result.length) {
                console.log('Invite delivered to', updatedUsers.result[0].username);
                return res.send({
                    id: updatedUsers.result[0]._id.toString(),
                    name: updatedUsers.result[0].username
                });
            }
            else {
                console.log('User not found');
                return res.sendStatus(204).send({});
            }
        }, function onRejected(reason) {
            console.log('Error finding and updating friend user.', reason);
            return res.sendStatus(304);
        })["catch"](function (err) { return err; });
    }
    else {
        return res.sendStatus(403);
    }
});
//+++++++++++++++++HANDLE DETELE TO API/USERS/FRIENDREQUEST+++++++++++++++++++++++++++++++
router["delete"]('/friendRequest/:contactId', function routeHandler(req, res, next) {
    console.log('Delete friend request from', req.params.contactId);
    if (req.isAuthenticated()) {
        stitchClient.login()
            .then(function onFulfilled() {
            console.log('Updating friend requests of', req.user.username);
            return Users.updateOne({
                _id: req.user._id
            }, {
                $pull: {
                    requests: { id: req.params.contactId }
                }
            });
        }, function onRejected() {
            console.log('Login failed');
            return res.sendStatus(500);
        })
            .then(function onFulfilled(updated) {
            console.log('Updated friend requests.');
            return res.send({});
        }, function onRejected(reason) {
            console.log('Delete friend request failed', reason);
            return res.sendStatus(500);
        })["catch"](function (err) { return err; });
    }
    else {
        return res.sendStatus(403);
    }
});
//+++++++++++++++++HANDLE PUT TO API/USERS/FRIENDS+++++++++++++++++++++++++++++++
router.put('/friends', function routeHandler(req, res, next) {
    console.log('Add friend', req.body.name);
    if (req.isAuthenticated()) {
        var newConvoDate_1 = Date.now(), newConvoName_1 = req.body.name + ', ' + req.user.username, newConvoPicture_1 = 'http://lorempixel.com/45/45/abstract/';
        stitchClient.login()
            .then(function onFulfilled() {
            console.log('Creating conversation for:', req.body.name, ',', req.user.username);
            var currentUser = {
                id: req.user._id.toString(),
                name: req.user.username,
                join_date: newConvoDate_1
            }, otherUser = {
                id: req.body.id,
                name: req.body.name,
                join_date: newConvoDate_1
            };
            return Conversations.insertOne({
                date: newConvoDate_1,
                participants: [
                    currentUser,
                    otherUser
                ],
                name: newConvoName_1,
                pictureUrl: newConvoPicture_1,
                messages: []
            });
        }, function onRejected(reason) {
            console.log('Login failed');
            return res.sendStatus(500);
        })
            .then(function onFulfilled(newConvo) {
            console.log('Created conversation', newConvo.insertedIds[0].toString());
            console.log('Making friends', req.body.name, '<-->', req.user.username);
            var currentUser = {
                id: req.user._id.toString(),
                name: req.user.username,
                pictureUrl: req.user.pictureUrl,
                conversation_id: newConvo.insertedIds[0].toString()
            }, otherUser = {
                id: req.body.id,
                name: req.body.name,
                pictureUrl: req.body.pictureUrl,
                conversation_id: newConvo.insertedIds[0].toString()
            }, createdConvo = {
                id: newConvo.insertedIds[0].toString(),
                name: newConvoName_1,
                pictureUrl: newConvoPicture_1
            };
            var userUpdatedPromise = Users.updateOne({ _id: req.user._id }, {
                $pull: { requests: { id: req.body.id } },
                $push: { friends: otherUser, conversations: createdConvo }
            });
            var friendUpdatedPromise = Users.updateOne({ _id: { $oid: req.body.id } }, {
                $push: { friends: currentUser, conversations: createdConvo }
            });
            return Promise.all([userUpdatedPromise, friendUpdatedPromise]);
            // res.sendStatus(200);
        }, function onRejected() {
            console.log('Creating conversation failed');
            return res.sendStatus(500);
        })
            .then(function onFulfilled(updated) {
            console.log('Updated friend list.', updated);
            return res.send({});
        }, function onRejected(reason) {
            console.log('Accept friend request failed', reason);
            return res.sendStatus(500);
        })["catch"](function (err) { return err; });
    }
    else {
        return res.sendStatus(403);
    }
});
//+++++++++++++++++HANDLE PUT TO API/USERS/CHATINVITATIONS+++++++++++++++++++++++++++++++
router.post('/chatInvitation', function routeHandler(req, res, next) {
    console.log('Chat', req.body.chat, 'from', req.body.host.name, 'to', req.body.friend.name);
    var chatRequest = {
        id: req.body.host.id,
        name: req.body.host.name,
        pictureUrl: req.body.host.pictureUrl,
        conversation_id: req.body.chat.id
    };
    if (req.isAuthenticated()) {
        stitchClient.login()
            .then(function onFulfilled() {
            console.log('DB Login. Update', req.body.friend.name, 'requests');
            return Users.updateOne({ _id: { $oid: req.body.friend.id } }, {
                $push: { requests: chatRequest }
            });
        }, function onRejected(reason) {
            console.log('Login failed', reason);
            return res.sendStatus(500);
        })
            .then(function onFulfilled(updatedUsers) {
            if (updatedUsers.result.length) {
                console.log('Invite added to', updatedUsers.result[0].username);
                return res.send({
                    id: updatedUsers.result[0]._id.toString(),
                    name: updatedUsers.result[0].username
                });
            }
            else {
                console.log('User not found');
                return res.sendStatus(204).send({});
            }
        }, function onRejected(reason) {
            console.log('Error finding and updating friend user.', reason);
            return res.sendStatus(304);
        })["catch"](function (err) { return err; });
    }
    else {
        return res.sendStatus(403);
    }
});
//+++++++++++++++++HANDLE DELETE TO API/USERS/USRID/CONVID+++++++++++++++++++++++++++++++
router["delete"]('/:convId', function leaveConversation(req, res, next) {
    console.log('Delete conversation', req.params.convId, 'for', req.user.username);
    console.log('Delete participant', req.user.username, 'from conversation', req.params.convId);
    if (req.isAuthenticated()) {
        stitchClient.login()
            .then(function onFulfilled() {
            console.log('DB Connected. Updating', req.user.username, '<<>>', req.params.convId);
            var usrUpdate = Users.updateOne({ _id: req.user._id }, { $pull: { conversations: { id: req.params.convId } } }), convUpdate = Conversations.updateOne({ _id: { $oid: req.params.convId } }, { $pull: { participants: { id: req.user._id.toString() } } });
            return Promise.all([usrUpdate, convUpdate]);
        }, function onRejected(reason) {
            console.log('Failed to connect to DB', reason);
            return res.sendStatus(500);
        })
            .then(function onFulfilled(_a) {
            var usrUpdate = _a[0], convUpdate = _a[1];
            console.log('Updated User', usrUpdate.result);
            console.log('Updated Conversation', convUpdate.result);
            if (convUpdate.result[0].participants.length < 1) {
                console.log('Conversation has no participants. Cleaning up.');
                //DELETE empty conversation: delete messages and conversation documents
                var msgsDeleted = Messages.deleteMany({ conversation_id: req.params.convId });
                var convDeleted = Conversations.deleteOne({ _id: { $oid: req.params.convId } });
                return Promise.all([msgsDeleted, convDeleted]);
            }
            else {
                return null;
            }
        }, function onRejected(reason) {
            console.log('Failed to update/delete conversations and users arrays', reason);
            return res.sendStatus(500);
        })
            .then(function onFulfilled(deletedConversation) {
            if (deletedConversation) {
                console.log('Correctly deleted messages and conversation');
            }
            return res.send({ conversationDeleted: deletedConversation ? true : false });
        }, function onRejected() { })["catch"](function (err) { return err; });
    }
    else {
        return res.sendStatus(403);
    }
});
exports["default"] = router;
