import * as express from 'express';
import * as mdbStitch from 'mongodb-stitch';

import * as passport from 'passport';

// type definitions not yet available in definitely typed. Using Any as type.
// Get the client for the xat-mxymz app
const stitchClient:any = new mdbStitch.StitchClient( 'xat-mxymz' );
// get database instance from of a mongodb object with the XAT name
const db = stitchClient.service('mongodb', 'mongodb-atlas').db('XAT');

let router = express.Router();


    router.post('/', function onPost(req, res, next) {

        if( req.isAuthenticated  ){

            console.log( req.body );

            let Conversations = db.collection('Conversations');
            // Conversations.insertOne( { 
            //     owner_id: stitchClient.authedId(),
            //     name:,
            //     date:,
            //     participants:,
            //     messages:
            // } );

        }

    } ); 

    router.get('/', function onGet(req, res, next){

    } );
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

export default router;