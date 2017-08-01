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
var router = express.Router();
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
            console.log('Error connecting to DB.');
            return res.sendStatus(reason);
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
            console.log('Error connecting to DB.');
            return res.sendStatus(reason);
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
router.post('/messages/:id/pending-receivers/', function deleteMessage(req, res, next) {
    // 'api/conversations/messages/'+msgId+'/pendingReceivers'
    console.log('Updating message...remove user from pending-receivers', req.params.id);
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
            // let msgId = insertedIds[0].toString();
            console.log('Updated message. Pending receivers:', updated.receivers.length);
            res.send(updated[0]._id.toString());
        }, function onRejected(reason) {
            console.log('Insertion failed.', reason);
            res.sendStatus(500);
        })["catch"](function (err) { return err; });
    }
    else {
        return res.sendStatus(403);
    }
});
//   confirmMessageReceived( msgId:string ){
//     return this.http.patch( 'api/conversations/messages'+msgId,'received' );
//   }
exports["default"] = router;
