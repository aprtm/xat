import * as express from 'express';
import * as mdbStitch from 'mongodb-stitch';

import { ObjectID } from 'mongodb'

import * as passport from 'passport';

// type definitions not yet available in definitely typed. Using Any as type.
// Get the client for the xat-mxymz app
const stitchClient:any = new mdbStitch.StitchClient( 'xat-mxymz' );
// get database instance from of a mongodb object with the XAT name
const db = stitchClient.service('mongodb', 'mongodb-atlas').db('XAT');
let Conversations = db.collection('Conversations');
let Messages = db.collection('Messages');

let router = express.Router();


router.get('/:id', function getConversation(req, res, next){
    console.log( 'Fetching conversation...',req.params.id );
    if( req.isAuthenticated ){
        
        stitchClient.login()

            .then(  function onFulfilled(){
                        console.log( 'Connected to DB.' );
                        let convo = Conversations.find( { _id:{$oid:req.params.id} } );
                        let messages = Messages.find( {conversation_id:req.params.id} );
                        return Promise.all( [convo,messages] );
                    }, 
                    function onRejected( reason ){
                        console.log( 'Error connecting to DB.' );
                        return res.sendStatus( reason );
                    }
            )

            .then(  function onFulfilled( [convo,msgs] ){
                        if( convo.length < 1){
                            console.log('No conversations match that id');
                            return res.sendStatus( 404 );
                        }
                        if( convo.length > 1 ){
                            console.log('Conflict');
                            return res.sendStatus(409).send('ID conflict');
                        }
                        console.log( 'Found and retrieved conversation', convo[0].name);
                        console.log( 'Conversation', convo[0].name, 'has', msgs.length, 'messages');

                        return res.send( {
                            conversation: convo[0],
                            messages: msgs
                        } );
                    },
                    function onRejected( reason ){
                        console.log( 'Error.', reason );
                        return res.sendStatus(204).send( reason );
                    }
            )

            .catch( err => err)
            
    }
    else{
        return res.sendStatus(403);
    }
} );

router.put('/:id/messages', function putMessage(req, res, next){
    console.log( 'Putting new message', req.body.message,'to conversation');
    console.dir(req.params.id)
    let currentMsg;

    if( req.isAuthenticated() ){
        stitchClient.login()
            .then(
                function onFulfilled(){
                    currentMsg = {
                        date: Date.now(),
                        author_id: req.user._id.toString(),
                        author_name: req.user.username,
                        conversation_id: req.params.id,
                        content:req.body.message,
                        receivers:req.body.toUsers
                    }
                    console.log('Trying to insert >',currentMsg.content, '< from', currentMsg.author_name)
                    
                    return Messages.insertOne( currentMsg );
                },
                function onRejected( reason ){
                    console.log( 'Error connecting to DB.' );
                    return res.sendStatus( reason );
                }
            )

            .then(
                function onFulfilled( {insertedIds} ){
                    let msgId = insertedIds[0].toString();
                    console.log('Inserted message id "',msgId,'". Updating convo...', req.params.id);
                    
                    return Conversations.updateOne( { _id:{$oid:req.params.id} },{ $push:{messages:msgId} } );

                },
                function onRejected(reason){
                    console.log('Insertion failed.',reason);
                    res.sendStatus(500);
                }
            )

            .then(
                function onFulfilled( updatedConvos ){
                    let msgIndex = updatedConvos.result[0].messages.length-1;
                    console.log('Updated correctly.',updatedConvos.result[0].messages[msgIndex]);
                    res.send( updatedConvos.result[0].messages[msgIndex] );
                },
                function onRejected(reason){
                    console.log('Update failed',reason);
                    res.sendStatus(500);
                }
            )

            .catch(err => err)
    }else{
        return res.sendStatus(403);
    }
});

router.post('/messages/:id/pending-receivers/', function deleteMessage(req, res, next){
    console.log( 'Updating message...remove user from pending-receivers', req.params.id );
    console.log( req.body.receiver_id,'===',req.user._id.toString() ); 
    if( req.isAuthenticated() ){
        stitchClient.login()

        .then(
            function onFulfilled(){
                console.log( 'Updating receivers of message',req.params.id );
                return  Messages.updateOne(
                    {
                        _id : { $oid : req.params.id }
                    },
                    {
                        $pull : {
                            receivers: { id : req.user._id.toString() }
                        }
                    }
                );
            },
            function onRejected(reason){
                console.log('Login failed.',reason);
                res.sendStatus(500);
            }
        )

        .then(
            function onFulfilled( updated ){
                console.log('Updated message.');
                return  res.send({});

            },
            function onRejected(reason){
                console.log('Insertion failed.',reason);
                res.sendStatus(500);
            }
        )

        .catch(err => err)
    }else{
        return res.sendStatus(403);
    }
});

export default router;