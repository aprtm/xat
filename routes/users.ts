import * as express from 'express';
import * as mdbStitch from 'mongodb-stitch';
import { ObjectID } from 'mongodb';

import * as passport from 'passport';

interface Friend{
    id:string, 
    name:string, 
    conversation_id?:string, 
    pictureUrl?:string
}

interface Participant extends Friend{
    join_date:number
}

// Get the client for the xat-mxymz app
const stitchClient:any = new mdbStitch.StitchClient( 'xat-mxymz' );
// get database instance from of a mongodb object with the XAT name
const db = stitchClient.service('mongodb', 'mongodb-atlas').db('XAT');
let Users = db.collection('Users');
let Conversations = db.collection('Conversations');

let router = express.Router();

//+++++++++++++++++HANDLE GET TO API/USERS+++++++++++++++++++++++++++++++
router.get('/:id', function routeHandler(req, res, next){
    console.log( 'Fetching user...',req.params.id );
    if( req.isAuthenticated() ){
        
        stitchClient.login()

            .then(  function onFulfilled(){
                        console.log( 'Connected to DB.' );
                        return Users.find( { _id:{$oid:req.params.id} } );
                    }, 
                    function onRejected( reason ){
                        console.log( 'Error connecting to DB.' );
                        return res.sendStatus( reason );
                    }
            )

            .then(  function onFulfilled( users ){
                        if( users.length < 1){
                            console.log('No users match that id');
                            return res.sendStatus( 404 );
                        }
                        if( users.length > 1 ){
                            console.log('Conflict');
                            return res.sendStatus(409).send('ID conflict');
                        }
                        console.log( 'Found and retrieved user', users[0].username);
                        return res.send( {
                            _id: users[0]._id,
                            username: users[0].username,
                            email: users[0].email,
                            pictureUrl: users[0].pictureUrl,
                            friends: users[0].friends,
                            conversations: users[0].conversations
                        } );
                    },
                    function onRejected( reason ){
                        console.log( 'Error ' );
                        return res.send( reason );
                    }
            )

            .catch( err => err)
            
    }
    else{
        return res.sendStatus(403);
    }
} );

//+++++++++++++++++HANDLE POST TO API/USERS/FRIENDREQUEST+++++++++++++++++++++++++++++++
router.post('/friendRequest', function routeHandler(req, res, next){
    console.log(req.body.fromContact.name,'friend request to', req.body.contactNameOrEmail );
    
    if( req.isAuthenticated() ){
        
        stitchClient.login()

            .then(
                function onFulfilled(){
                    console.log('looking for',req.body.contactNameOrEmail);
                    const upsert = true;
                    return  Users.updateOne(
                                { $or:[
                                    { username: req.body.contactNameOrEmail },
                                    { email: req.body.contactNameOrEmail }
                                ] }, {
                                    $push:{ requests:req.body.fromContact } 
                                } );

                },
                function onRejected(reason){
                    console.log('Login failed',reason);
                    return res.sendStatus(500);
                }
            )

            .then(
                function onFulfilled( updatedUsers ){
                    if( updatedUsers.result.length ){
                        console.log( 'Invite delivered to',updatedUsers.result[0].username );
                        return res.send( {
                            id: updatedUsers.result[0]._id.toString(),
                            name: updatedUsers.result[0].username
                        } );
                    }else{
                        console.log( 'User not found' );
                        return res.sendStatus(204).send( {} );
                    }
                    
                },
                function onRejected( reason ){
                    console.log('Error finding and updating friend user.', reason);
                    return res.sendStatus( 304 );
                }
            )

            .catch( err => err)
    }
    else{
        return res.sendStatus(403);
    }
    
} );

//+++++++++++++++++HANDLE DETELE TO API/USERS/FRIENDREQUEST+++++++++++++++++++++++++++++++
router.delete('/friendRequest/:contactId', function routeHandler(req, res, next){
    console.log('Delete friend request from', req.params.contactId );
    
    if( req.isAuthenticated() ){
        
        stitchClient.login()

            .then(
                function onFulfilled(){
                console.log( 'Updating friend requests of',req.user.username );
                return  Users.updateOne(
                    {
                        _id : req.user._id
                    },
                    {
                        $pull : {
                            requests: { id : req.params.contactId }
                        }
                    }
                );
                },
                function onRejected(){
                    console.log('Login failed');
                    return res.sendStatus(500);
                }
            )

            .then(
                function onFulfilled( updated ){
                    console.log('Updated friend requests.');
                    return  res.send({});

                },
                function onRejected(reason){
                    console.log('Delete friend request failed',reason);
                    return res.sendStatus(500);
                }
                
            )

            .catch( err => err)
    }
    else{
        return res.sendStatus(403);
    }

});

//+++++++++++++++++HANDLE PUT TO API/USERS/FRIENDS+++++++++++++++++++++++++++++++
router.put('/friends', function routeHandler(req, res, next){
    console.log('Add friend', req.body.name );
    
    if( req.isAuthenticated() ){

        let newConvoDate:number = Date.now(),
            newConvoName:string = req.body.name+', '+req.user.username,
            newConvoPicture:string = 'http://lorempixel.com/45/45/abstract/';

        stitchClient.login()

            .then(
                function onFulfilled(){
                    console.log('Creating conversation for:',req.body.name,',',req.user.username);
                    
                    let currentUser:Participant = {
                        id: req.user._id.toString(),
                        name: req.user.username,
                        join_date: newConvoDate
                    },
                        otherUser:Participant = {
                        id: req.body.id,
                        name: req.body.name,
                        join_date: newConvoDate
                    };
                    
                    return Conversations.insertOne(
                        {
                            date: newConvoDate,
                            participants:[
                                currentUser,
                                otherUser
                            ],
                            name: newConvoName,
                            pictureUrl: newConvoPicture,
                            messages: []
                        }
                    )
                },
                function onRejected( reason ){
                    console.log('Login failed');
                    return res.sendStatus(500);
                }
            )

            .then(
                function onFulfilled( newConvo ){
                    console.log( 'Created conversation',newConvo.insertedIds[0].toString() );
                    console.log( 'Making friends',req.body.name,'<-->',req.user.username );

                    let currentUser:Friend = {
                            id: req.user._id.toString(),
                            name: req.user.username,
                            pictureUrl: req.user.pictureUrl,
                            conversation_id: newConvo.insertedIds[0].toString()
                        },
                        otherUser:Friend = {
                            id: req.body.id,
                            name: req.body.name,
                            pictureUrl: req.body.pictureUrl,
                            conversation_id: newConvo.insertedIds[0].toString()
                        },
                        createdConvo = {
                            id: newConvo.insertedIds[0].toString(),
                            name: newConvoName,
                            pictureUrl: newConvoPicture
                        };
                    
                    let userUpdatedPromise = Users.updateOne(
                        { _id : req.user._id },
                        {
                            $pull : { requests: { id: req.body.id } },
                            $push : { friends: otherUser, conversations: createdConvo },

                        } 
                    );
                    
                    let friendUpdatedPromise = Users.updateOne(
                        { _id : {$oid:req.body.id} },
                        {
                            $push : { friends: currentUser, conversations: createdConvo },
                        }
                    );

                    return Promise.all([userUpdatedPromise, friendUpdatedPromise])
                    
                    // res.sendStatus(200);

                },
                function onRejected(){
                    console.log('Creating conversation failed');
                    return res.sendStatus(500);
                }
            )

            .then(
                function onFulfilled( updated ){
                    console.log('Updated friend list.',updated);
                    return  res.send({});

                },
                function onRejected(reason){
                    console.log('Accept friend request failed',reason);
                    return res.sendStatus(500);
                }
            )

            .catch( err => err)
    }
    else{
        return res.sendStatus(403);
    }

} );

//+++++++++++++++++HANDLE PUT TO API/USERS/CHATINVITATIONS+++++++++++++++++++++++++++++++
router.post('/chatInvitation', function routeHandler(req, res, next){
    console.log( 'Chat', req.body.chat, 'from', req.body.host.name, 'to', req.body.friend.name );
    let chatRequest = {
        id: req.body.host.id,
        name: req.body.host.name,
        pictureUrl: req.body.host.pictureUrl,
        conversation_id:req.body.chat.id
    }
    if( req.isAuthenticated() ){
        
        stitchClient.login()

            .then(
                function onFulfilled(){
                    console.log('DB Login. Update',req.body.friend.name,'requests');
                    return  Users.updateOne(
                                { _id: {$oid:req.body.friend.id} }, {
                                    $push:{ requests: chatRequest } 
                                } );
                },
                function onRejected(reason){
                    console.log('Login failed',reason);
                    return res.sendStatus(500);
                }
            )

            .then(
                function onFulfilled( updatedUsers ){
                    if( updatedUsers.result.length ){
                        console.log( 'Invite added to',updatedUsers.result[0].username );
                        return res.send( {
                            id: updatedUsers.result[0]._id.toString(),
                            name: updatedUsers.result[0].username
                        } );
                    }else{
                        console.log( 'User not found' );
                        return res.sendStatus(204).send( {} );
                    }
                    
                },
                function onRejected( reason ){
                    console.log('Error finding and updating friend user.', reason);
                    return res.sendStatus( 304 );
                }
            )

            .catch( err => err)
    }
    else{
        return res.sendStatus(403);
    }
    
} );


export default router;