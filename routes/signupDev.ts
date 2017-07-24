import * as express from 'express';
import * as mongodb from 'mongodb';
import * as passport from 'passport';

let router = express.Router();

const mongoUrl = 'mongodb://localhost:27017/XAT';
let MongoClient = mongodb.MongoClient;
let ObjectId = mongodb.ObjectID;

//+++++++++++++++++ HANDLE POST TO API/SIGNUP +++++++++++++++++++++++++++++++
//+++++++++++++++++ REQUIRES AUTHENTICATION +++++++++++++++++++++++++++++++
router.post('/', function onPost(req, res, next) {

    passport.authenticate( 'signup-local', function done(err, user, info){
        if( err ){
            console.log('Error with signup-local strategy');
            return next( err );
        }
        if( !user ){
            console.log( 'Credentials conflict with existing data.' );
            return res.status( 409 ).send( info.message );
        }

        // login anonymously (no arguments) to the client.
        MongoClient.connect(mongoUrl).then( function fulfill(db){

            // get a collection and test its api
            let Users = db.collection('Users');

            return Users.insertOne( {
                    username:user.username,
                    password:user.hash,
                    email:req.body.email 
                } );

        }, function reject(reason){
            console.log(reason);
            return next( reason );
        })

        .then(function fulfill( newUser ){
            console.log( 'Successfully registered new user.', newUser.ops );
            return res.send( newUser.insertedId );

        }, function reject( reason ){

            console.log( reason );
            return res.send( reason );
        });

    })(req, res, next);

});


//+++++++++++++++++ CLIENT VALIDATION ENDPOINTS +++++++++++++++++++++++++++++++
//+++++++++++++++++ HANDLE GET FROM API/SIGNUP/USERNAME +++++++++++++++++++++++++++++++
router.get('/username/:username', function onGet( req, res, next){
        // login anonymously (no arguments) to the client.
    MongoClient.connect(mongoUrl).then( function fulfill(db){

            let Users = db.collection('Users');
            // console.log( 'gets here! params:', req.params.username);
            let u = Users.find( {'username':req.params.username} );
            // console.log( 'Username uniqueness check found', u );
            return u;

    }, function reject(reason){
        console.log(reason)
        return reason;
    })
    .then(function fulfill(user){
        console.log( user.cursorState );
        res.send( !!user.cursorState.documents.length );
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
router.get('/email/:email', function onGet( req, res, next){
        // login anonymously (no arguments) to the client.
    MongoClient.connect(mongoUrl).then( function fulfill(db){

            // get a collection and test its api
            let Users = db.collection('Users');
            // console.log( 'gets here! params:', req.params.username);
            let u = Users.find( {'email':req.params.email} );
            // console.log( 'Email uniqueness check found', u);
            return u;

    }, function reject(reason){
        console.log(reason)
        return reason;
    })
    .then(function fulfill(user){
        console.log( user.cursorState.documents );
        res.send( !!user.cursorState.documents.length );
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