import * as express from 'express';
// import * as mdbStitch from 'mongodb-stitch';

import * as passport from 'passport';

import * as bcrypt from 'bcrypt';
import * as mongodb from 'mongodb';


const mongoUrl = 'mongodb://localhost:27017/XAT';
let MongoClient = mongodb.MongoClient;
let ObjectId = mongodb.ObjectID;

export function signupVerifyDev(req, username, password, done ){
        
        let applicant = {
            username: '',
            hash: '',
            email: ''
        };

        MongoClient.connect(mongoUrl)
            .then( function onFulfilled(db){

                console.log('Database client connection successful')
                //after logging in to the database get the Users collection and find the username
                let UsersCollection = db.collection('Users');
                let usersFound = UsersCollection.find( { $or: [ {username: username}, {email:req.body.email} ] } );

                return usersFound;
                
            }, function onRejected(reason){
                console.log('Database client connection rejected')
                return done( reason );
            } )

            .then(function onFulfilled( users ){
                console.log('Retrieved user data. Users found:', users.cursorState.documents.length );

                if( users.cursorState.documents.length !== 0 ){
                    if( users.cursorState.documents[0].username === username) {
                        console.log('Username already in use.');
                        return done( null, false, {message: 'Username in use.'} );
                    }
                    if( users.cursorState.documents[0].email === req.body.email) {
                        console.log('Email already registered.');
                        return done( null, false, {message: 'Email in use.'} );
                    }
                }

                applicant.username = username;
                applicant.email = req.body.email;

                return bcrypt.hash(password, 10);

            }, function onRejected( reason ){
                console.log('Rejection while fetching user data.', reason)
                return done( reason );
            })

            .then(function onFulfilled( hash ){
                applicant.hash = hash;
                done( null, applicant );

            }, function onRejected( reason ){

                console.log('Rejection while handling user data.', reason);
                return done( reason );

            })

            .catch( (err)=>{ console.log('Error while handling login request. '); return done(err) } );

    }