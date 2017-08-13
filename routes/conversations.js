"use strict";
exports.__esModule = true;
var express = require("express");
var mdbStitch = require("mongodb-stitch");
// type definitions not yet available in definitely typed. Using Any as type.
// Get the client for the xat-mxymz app
var stitchClient = new mdbStitch.StitchClient('xat-mxymz');
// get database instance from of a mongodb object with the XAT name
var db = stitchClient.service('mongodb', 'mongodb-atlas').db('XAT');
var Conversations = db.collection('Conversations');
var Messages = db.collection('Messages');
var Users = db.collection('Users');
var router = express.Router();
//+++++++++++++++++HANDLE POST TO API/CONVERSATIONS/+++++++++++++++++++++++++++++++
router.post('/', function postConversation(req, res, next) {
    var dateNow = Date.now();
    var convoName = req.body.conversationName || req.body.creator.name + ' and friends';
    req.body.join_date = dateNow;
    console.log('Creating conversation ' + convoName, req.body.creator);
    if (req.isAuthenticated()) {
        stitchClient.login()
            .then(function onFulfilled() {
            console.log('Logged in to DB.');
            return Conversations.insertOne({
                date: dateNow,
                creator_id: req.user._id.toString(),
                participants: [req.body.creator],
                name: convoName,
                pictureUrl: 'http://lorempixel.com/45/45/abstract/',
                messages: []
            });
        }, function onRejected(reason) {
            console.log('Error connecting to DB.');
            return res.send(reason);
        })
            .then(function onFulfilled(newConvId) {
            //ADD NEW CONVERSATION ID TO CURRENT USER'S CONVERSATIONS ARRAY
            console.log('Created conversation', newConvId.insertedIds[0].toString());
            var newConversation = Conversations.find({ _id: newConvId.insertedIds[0] });
            var updatedUser = Users.updateOne({ _id: req.user._id }, { $push: { conversations: {
                        id: newConvId.insertedIds[0].toString(),
                        name: convoName,
                        pictureUrl: 'http://lorempixel.com/45/45/abstract/'
                    } } });
            return Promise.all([newConversation, updatedUser]);
        }, function onRejected(reason) {
            console.log('Failed to create conversation.', reason);
            return res.sendStatus(500);
        })
            .then(function onFulfilled(_a) {
            var newConversation = _a[0], updatedUser = _a[1];
            console.log('New conversation:', newConversation[0]);
            console.log('User updated:', updatedUser.result[0]);
            return res.send(newConversation[0]);
        }, function onRejected(reason) {
            console.log('Failed to create conversation or update user.', reason);
            return res.sendStatus(500);
        })["catch"](function (err) { return err; });
    }
    else {
        return res.sendStatus(403);
    }
});
//+++++++++++++++++HANDLE POST TO API/CONVERSATIONS/:CONVID/PARTICIPANTS+++++++++++++++++++++++++++++++
router.post('/:convId/participants', function addParticipant(req, res, next) {
    console.log('Add current user', req.user.username, 'to conversation', req.params.convId);
    // console.log( 'Available body:', req.body, '. Available user:', req.user );
    if (req.isAuthenticated) {
        var dateNow = Date.now(), userParticipant_1 = {
            id: req.user._id.toString(),
            name: req.user.username,
            pictureUrl: req.user.pictureUrl,
            join_date: dateNow
        };
        stitchClient.login()
            .then(function onFulfilled() {
            console.log('DB connected. Add', req.user.username);
            return Conversations.updateOne({ _id: { $oid: req.params.convId } }, { $push: { participants: userParticipant_1 } });
        }, function onRejected(reason) {
            console.log('Error connecting to DB.', reason);
            return res.sendStatus(500);
        })
            .then(function onFulfilled(updated) {
            updated = updated.result[0];
            console.log('Updated conversation', updated.name);
            var chat = {
                id: updated._id.toString(),
                name: updated.name,
                pictureUrl: updated.pictureUrl
            };
            return Users.updateOne({ _id: req.user._id }, { $push: { conversations: chat } });
        }, function onRejected(reason) {
            console.log('Failed to update conversation', reason);
            return res.sendStatus(500);
        })
            .then(function onFulfilled(updated) {
            updated = updated.result[0];
            console.log('Updated user', updated.username);
            return res.send(req.params.convId);
        }, function onRejected(reason) {
            console.log('Failed to update user with new conversation', reason);
            return res.sendStatus(500);
        })["catch"](function (err) { return err; });
    }
    else {
        return res.sendStatus(403);
    }
});
//+++++++++++++++++HANDLE GET TO API/CONVERSATIONS/:ID+++++++++++++++++++++++++++++++
router.get('/:id', function getConversation(req, res, next) {
    console.log('Fetching conversation...', req.params.id);
    if (req.isAuthenticated) {
        stitchClient.login()
            .then(function onFulfilled() {
            console.log('Connected to DB.');
            var convo = Conversations.find({ _id: { $oid: req.params.id } });
            var messages = Messages.find({ conversation_id: req.params.id });
            return Promise.all([convo, messages]);
        }, function onRejected(reason) {
            console.log('Error connecting to DB.', reason);
            return res.sendStatus(500);
        })
            .then(function onFulfilled(_a) {
            var convo = _a[0], msgs = _a[1];
            if (convo.length < 1) {
                console.log('No conversations match that id');
                return res.sendStatus(404);
            }
            if (convo.length > 1) {
                console.log('Conflict');
                return res.sendStatus(409).send('ID conflict');
            }
            console.log('Found and retrieved conversation', convo[0].name);
            console.log('Conversation', convo[0].name, 'has', msgs.length, 'messages');
            return res.send({
                conversation: convo[0],
                messages: msgs
            });
        }, function onRejected(reason) {
            console.log('Error.', reason);
            return res.sendStatus(204).send(reason);
        })["catch"](function (err) { return err; });
    }
    else {
        return res.sendStatus(403);
    }
});
//+++++++++++++++++HANDLE PUT TO API/CONVERSATIONS/:ID/MESSAGES/+++++++++++++++++++++++++++++++
router.put('/:id/messages', function putMessage(req, res, next) {
    console.log('Putting new message', req.body.message, 'to conversation');
    console.dir(req.params.id);
    var currentMsg;
    if (req.isAuthenticated()) {
        stitchClient.login()
            .then(function onFulfilled() {
            currentMsg = {
                date: Date.now(),
                author_id: req.user._id.toString(),
                author_name: req.user.username,
                conversation_id: req.params.id,
                content: req.body.message,
                receivers: req.body.toUsers
            };
            console.log('Trying to insert >', currentMsg.content, '< from', currentMsg.author_name);
            return Messages.insertOne(currentMsg);
        }, function onRejected(reason) {
            console.log('Error connecting to DB.', reason);
            return res.sendStatus(500);
        })
            .then(function onFulfilled(_a) {
            var insertedIds = _a.insertedIds;
            var msgId = insertedIds[0].toString();
            console.log('Inserted message id "', msgId, '". Updating convo...', req.params.id);
            return Conversations.updateOne({ _id: { $oid: req.params.id } }, { $push: { messages: msgId } });
        }, function onRejected(reason) {
            console.log('Insertion failed.', reason);
            res.sendStatus(500);
        })
            .then(function onFulfilled(updatedConvos) {
            var msgIndex = updatedConvos.result[0].messages.length - 1;
            console.log('Updated correctly.', updatedConvos.result[0].messages[msgIndex]);
            res.send(updatedConvos.result[0].messages[msgIndex]);
        }, function onRejected(reason) {
            console.log('Update failed', reason);
            res.sendStatus(500);
        })["catch"](function (err) { return err; });
    }
    else {
        return res.sendStatus(403);
    }
});
//+++++++++++++++++HANDLE POST TO API/CONVERSATIONS/MESSAGES/:ID/PENDING-RECEIVERS+++++++++++++++++++++++++++++++
router.post('/messages/:id/pending-receivers/', function deleteMessage(req, res, next) {
    console.log('Updating message...remove user from pending-receivers', req.params.id);
    console.log(req.body.receiver_id, '===', req.user._id.toString());
    if (req.isAuthenticated()) {
        stitchClient.login()
            .then(function onFulfilled() {
            console.log('Updating receivers of message', req.params.id);
            return Messages.updateOne({
                _id: { $oid: req.params.id }
            }, {
                $pull: {
                    receivers: { id: req.user._id.toString() }
                }
            });
        }, function onRejected(reason) {
            console.log('Login failed.', reason);
            res.sendStatus(500);
        })
            .then(function onFulfilled(updated) {
            console.log('Updated message.');
            return res.send({});
        }, function onRejected(reason) {
            console.log('Insertion failed.', reason);
            res.sendStatus(500);
        })["catch"](function (err) { return err; });
    }
    else {
        return res.sendStatus(403);
    }
});
exports["default"] = router;
