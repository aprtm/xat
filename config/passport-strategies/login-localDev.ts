import * as express from 'express';
// import * as mdbStitch from 'mongodb-stitch';
import * as passport from 'passport';
import * as bcrypt from 'bcrypt';
import * as mongodb from 'mongodb';


const mongoUrl = 'mongodb://localhost:27017/XAT';
let MongoClient = mongodb.MongoClient;
let ObjectId = mongodb.ObjectID;

export function loginVerifyDev( username, password, done){

        MongoClient.connect(mongoUrl)
            .then( function onFulfilled(db){

                console.log('Database client connection successful')
                //after logging in to the database get the Users collection and find the username
                let Users = db.collection('Users');
                let findUser = Users.find( { $or: [ {username: username}, {email: username} ] } );

                return findUser;
                
            }, function onRejected(reason){
                console.log('Database client connection rejected')
                return done( reason );
            } )

            .then(function onFulfilled( users ){
                console.log('Users that match credentials: ', users.length);
                if( users.length !== 1 ){
                    console.log('Username not in database.');
                    return done( null, false, {message: 'Could not find user.'} );
                }
                
                bcrypt.compare(password, users[0].password, function( err, authenticated ){
                    if( err ){
                        console.log( 'Failed password verification.:', err );
                        return done( err );
                    }
                    if( authenticated ){
                        console.log( 'All good. Logged in.' );
                        return done( null, users[0], {message:'User logged in.'} );
                    }else{
                        console.log( 'Password check went bad.' );
                        return done( null, false, {message:'Wrong password.'} );
                    }
                });

            }, function onRejected( reason ){
                console.log('Rejection while fetching user data.')
                return done( reason );
            })

            .catch( (err)=>{ console.log('Error while handling login request. '); return done(err) } );

    }