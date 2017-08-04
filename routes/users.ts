import * as express from 'express';
import * as mdbStitch from 'mongodb-stitch';
import { ObjectID } from 'mongodb';

import * as passport from 'passport';

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
    
    interface Friend{
        id:string, 
        name:string, 
        join_date:number, 
        conversation_id?:string, 
        pictureUrl?:string
    }
    if( req.isAuthenticated() ){

        let convoDate:number = Date.now(),
        currentUserContact:Friend = {
            id: req.user._id.toString(),
            name: req.user.username,
            join_date: convoDate
        };

        stitchClient.login()

            .then(
                function onFulfilled(){
                    console.log('Creating conversation for:',req.body.name,',',req.user.username);

                    req.body.join_date = convoDate;
                    
                    
                    return Conversations.insertOne(
                        {
                            date: convoDate,
                            participants:[
                                currentUserContact,
                                req.body
                            ],
                            name: req.body.name+','+currentUserContact.name,
                            pictureUrl: '',
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
                    console.log( 'Requestee', req.body );
                    req.body.conversation_id = newConvo.insertedIds[0].toString();
                    currentUserContact.conversation_id = newConvo.insertedIds[0].toString();
                    currentUserContact.pictureUrl = req.user.pictureUrl;
                    
                    let userUpdated = Users.updateOne(
                        { _id : req.user._id },
                        {
                            $pull : { requests: { id: req.body.id } },
                            $push : { friends: req.body, conversations: newConvo.insertedIds[0].toString() },

                        } 
                    );
                    
                    let friendUpdated = Users.updateOne(
                        { _id : {$oid:req.body.id} },
                        {
                            $push : { friends: currentUserContact, conversations: newConvo.insertedIds[0].toString() },
                        }
                    );

                    return Promise.all([userUpdated, friendUpdated])
                    
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

//+++++++++++++++++HANDLE PUT TO API/USERS/FRIENDREQUEST+++++++++++++++++++++++++++++++
// router.get('/friendRequest', function routeHandler(req, res, next){
//     console.log('Getting friend requests', req.body.name );
    
//     if( req.isAuthenticated() ){
        
//         stitchClient.login()

//             .then(
//                 function onFulfilled(){
//                     console.log('Request user friend requests', )
//                     return
//                 },
//                 function onRejected( reason ){
//                     console.log('Login failed');
//                     return res.sendStatus(500);
//                 }
//             )

//             .catch( err => err)
    
//     } else {
//         return res.sendStatus(403);
//     }
// } );


export default router;