import * as express from 'express';
import * as mdbStitch from 'mongodb-stitch';

let router = express.Router();

// type definitions not yet available in definitely typed. Using Any as type.
// Get the client for the xat-mxymz app
const stitchClient:any = new mdbStitch.StitchClient( 'xat-mxymz' );
// get database instance from of a mongodb object with the XAT name
const db = stitchClient.service('mongodb', 'mongodb-atlas').db('XAT');

    /* POST new user. */
    router.post('/', function(req, res, next) {

        // login anonymously (no arguments) to the client.
        stitchClient.login().then( function fulfill(){

                // get a collection and test its api
                let Users = db.collection('Users');

                //TODO: Check that the username and email are not already in use
                return Users.insertOne({
                    owner_id: stitchClient.authedId(),
                    username:req.body.username,
                    password:req.body.password,
                    email:req.body.email} );

        }, function reject(reason){
            console.log(reason)
            return reason;
        })
        .then(function fulfill(){
            res.sendStatus(200);
            res.end();
        }, function reject(reason){
            console.log(reason);
            res.sendStatus(500);
            res.end();
        });

    });

    /* GET a username */
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

    /* GET an email */
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