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
router.post('/', function onPost(req, res, next) {
    if (req.isAuthenticated) {
        console.log(req.body);
        var Conversations = db.collection('Conversations');
        // Conversations.insertOne( { 
        //     owner_id: stitchClient.authedId(),
        //     name:,
        //     date:,
        //     participants:,
        //     messages:
        // } );
    }
});
router.get('/', function onGet(req, res, next) {
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
