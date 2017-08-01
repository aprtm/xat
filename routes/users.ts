import * as express from 'express';
import * as mdbStitch from 'mongodb-stitch';
import { ObjectID } from 'mongodb';

import * as passport from 'passport';

// Get the client for the xat-mxymz app
const stitchClient:any = new mdbStitch.StitchClient( 'xat-mxymz' );
// get database instance from of a mongodb object with the XAT name
const db = stitchClient.service('mongodb', 'mongodb-atlas').db('XAT');
let Users = db.collection('Users');

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
                            pictureUrl: users[0].picture,
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
                function onRejected(){
                    console.log('Login failed');
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

export default router;