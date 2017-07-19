import * as express from 'express';
import * as mdbStitch from 'mongodb-stitch';

import * as passport from 'passport';

let router = express.Router();

// type definitions not yet available in definitely typed. Using Any as type.
// Get the client for the xat-mxymz app
const stitchClient:any = new mdbStitch.StitchClient( 'xat-mxymz' );
// get database instance from of a mongodb object with the XAT name
const db = stitchClient.service('mongodb', 'mongodb-atlas').db('XAT');


//+++++++++++++++++ HANDLE POST TO API/SIGNUP +++++++++++++++++++++++++++++++
    router.post('/', function(req, res, next) {

        passport.authenticate( 'signup-local', function(err, user, info){
            if( err ){
                console.log('Error with signup-local strategy');
                return next( err );
            }
            if( !user ){
                console.log( 'Credentials conflict with existing data.' );
                return res.status( 409 ).send( info.message );
            }

            // login anonymously (no arguments) to the client.
            stitchClient.login().then( function fulfill(){

                // get a collection and test its api
                let Users = db.collection('Users');

                return Users.insertOne( {
                        owner_id: stitchClient.authedId(),
                        username:user.username,
                        password:user.hash,
                        email:req.body.email 
                    } );

            }, function reject(reason){
                console.log(reason);
                return next( reason );
            })

            .then(function fulfill( newUser ){
                console.log( 'Successfully registered new user.' );
                return res.send( 'Successfully registered.' );

            }, function reject( reason ){

                console.log( reason );
                return res.send( reason );
            });

        })(req, res, next);

    });


//+++++++++++++++++ CLIENT VALIDATION ENDPOINTS +++++++++++++++++++++++++++++++
//+++++++++++++++++ HANDLE GET FROM API/SIGNUP/USERNAME +++++++++++++++++++++++++++++++
    router.get('/username/:username', function( req, res, next){
         // login anonymously (no arguments) to the client.
        stitchClient.login().then( function fulfill(){

                let Users = db.collection('Users');
                // console.log( 'gets here! params:', req.params.username);
                let u = Users.find( {username:req.params.username} );
                return u;

        }, function reject(reason){
            console.log(reason)
            return reason;
        })
        .then(function fulfill(user){
            let exists = user.length;
            res.send( !!exists );
            res.end();
        }, function reject(reason){
            console.log(reason);
            res.sendStatus(500);
            res.end();
        })
        .catch((err)=>console.log(err));

        console.log('Got a request!');
    });

//+++++++++++++++++ HANDLE GET FROM API/SIGNUP/USERNAME +++++++++++++++++++++++++++++++
    router.get('/email/:email', function( req, res, next){
         // login anonymously (no arguments) to the client.
        stitchClient.login().then( function fulfill(){

                // get a collection and test its api
                let Users = db.collection('Users');
                // console.log( 'gets here! params:', req.params.username);
                let u = Users.find( {email:req.params.email} );
                return u;

        }, function reject(reason){
            console.log(reason)
            return reason;
        })
        .then(function fulfill(user){
            let exists = user.length;
            res.send( !!exists );
            res.end();
        }, function reject(reason){
            console.log(reason);
            res.sendStatus(500);
            res.end();
        })
        .catch((err)=>console.log(err));

        console.log('Got a request!');
    });

export default router;