"use strict";
exports.__esModule = true;
var express = require("express");
var mdbStitch = require("mongodb-stitch");
// type definitions not yet available in definitely typed. Using Any as type.
// Get the client for the xat-mxymz app
var stitchClient = new mdbStitch.StitchClient('xat-mxymz');
// get database instance from of a mongodb object with the XAT name
var db = stitchClient.service('mongodb', 'mongodb-atlas').db('XAT');
var router = express.Router();
router.get('/:id', function getConversation(req, res, next) {
    console.log('Fetching conversation...', req.params.id);
    if (req.isAuthenticated) {
        stitchClient.login()
            .then(function onFulfilled() {
            var Conversations = db.collection('Conversations');
            console.log('Connected to DB.');
            return Conversations.find({ _id: { $oid: req.params.id } });
        }, function onRejected(reason) {
            console.log('Error connecting to DB.');
            return res.sendStatus(reason);
        })
            .then(function onFulfilled(convo) {
            if (convo.length < 1) {
                console.log('No conversations match that id');
                return res.sendStatus(404);
            }
            if (convo.length > 1) {
                console.log('Conflict');
                return res.sendStatus(409).send('ID conflict');
            }
            console.log('Found and retrieved conversation', convo[0].name);
            return res.send({
                _id: convo[0]._id,
                date: convo[0].date,
                name: convo[0].name,
                pictureUrl: convo[0].pictureUrl || '',
                participants: convo[0].participants,
                messages: convo[0].messages
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
    if (req.isAuthenticated()) {
        stitchClient.login()
            .then(function onFulfilled() {
            var Conversations = db.collection('Conversations');
            var currentMsg = {
                date: Date.now(),
                owner_id: req.user._id.toString(),
                owner_name: req.user.username,
                content: req.body.message
            };
            console.log('Trying to insert', currentMsg);
            return Conversations.updateOne({ _id: { $oid: req.params.id } }, { $push: { messages: currentMsg } });
        }, function onRejected(reason) {
            console.log('Error connecting to DB.');
            return res.sendStatus(reason);
        })
            .then(function onFulfilled(obj) {
            console.log('message insertion success', obj.result[0]);
            var msgIndex = obj.result[0].messages.length - 1;
            res.send(obj.result[0].messages[msgIndex]);
        }, function onRejected(reason) {
            console.log('Message insertion failed', reason);
            res.sendStatus(500);
        })["catch"](function (err) { return err; });
    }
    else {
        return res.sendStatus(403);
    }
});
/*
        createConversation( conversation:Conversation ){
            return this.http.post( '/api/conversations', conversation, {headers:this.header} );
        }

        getConversation( cId:string ){
            return this.http.get( '/api/conversations/'+cId);
        }

        sendMessage( cId:string, message:Message ){
            return this.http.put( '/api/conversations/'+cId+'/messages', message, {headers:this.header} );
        }

        addParticipant( cId:string, participant:Participant ){
            return this.http.put( 'api/conversations/'+cId+'/participants', participant, {headers:this.header} );
        }

        changeName( cId:string, name:string ){
            return this.http.put( 'api/conversations/'+cId+'name', name, {headers:this.header} );
        }
    */
exports["default"] = router;
