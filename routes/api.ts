import * as express from 'express';
import * as mdbStitch from 'mongodb-stitch';

let router = express.Router();

// type definitions not yet available in definitely typed. Using Any as type.
// Get the client for the xat-mxymz app
const stitchClient:any = new mdbStitch.StitchClient( 'xat-mxymz' );
// get database instance from of a mongodb object with the XAT name
const db = stitchClient.service('mongodb', 'mongodb-atlas').db('XAT');

    /* POST new user. */
    router.post('/signup', function(req, res, next) {

        // login anonymously (no arguments) to the client.
        stitchClient.login().then( function fulfill(){

                // get a collection and test its api
                let Users = db.collection('Users');

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

    /* GET a user. */

    router.get('/signup/:username', function( req, res, next){
         // login anonymously (no arguments) to the client.
        stitchClient.login().then( function fulfill(){

                // get a collection and test its api
                let Users = db.collection('Users');
                console.log( 'gets here! params:', req.params.username);
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
        .catch((err)=>console.log('Cought: ', err));

        console.log('Got a request!');
    });

export default router;
// export default router;

// const db = client.service('mongodb', 'mongodb-atlas').db('XAT');

// //the write operations require a field owner_id to match with the id of the connected authenticated user
// client.login().then(() =>
//   db.collection('Users').updateOne(
//       { owner_id: client.authedId() },
//       { $set:{username:'TEST'} },
//       {upsert:true} 
//     )
// ).then(() =>
//   db.collection('Users').find({owner_id: client.authedId()})
// ).then(docs => {
//   console.log("Found docs", docs)
//   console.log("[MongoDB Stitch] Connected to Stitch")
// }).catch(err => {
//   console.error(err)
// });
