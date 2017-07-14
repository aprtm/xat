import * as express from 'express';
import * as mdbStitch from 'mongodb-stitch';

import * as passport from 'passport';
import * as passportLocal from 'passport-local';

let LocalStrategy = passportLocal.Strategy;

// Get the client for the xat-mxymz app
const stitchClient:any = new mdbStitch.StitchClient( 'xat-mxymz' );
// get database instance from of a mongodb object with the XAT name
const db = stitchClient.service('mongodb', 'mongodb-atlas').db('XAT');

export default function passportInit(){

    //++++++++++++++CONFIGURE LOGIN AUTHENTICATION++++++++++++++++++++++
    passport.use('loginStrat', new LocalStrategy(function(username, password, done){
        stitchClient.login()

            .then( function onFulfilled(response){
                console.log('Database client connection successful')
                //after logging in to the database get the Users collection and find the username
                let Users = db.collection('Users');
                return Users.find( {username: username} );
                
            }, function onRejected(reason){
                console.log('Database client connection rejected')
                return done( reason );
            } )


            .then(function onFulfilled( users ){

                if( users.length !== 1 ){
                    console.log(done);
                    return done( null, false, {message: '=( Check your username/password and try again'} );
                }
                if( !isPasswordValid( users[0], password ) ){
                    return done(null, false, {message: '=( Check your username/password and try again'} );
                }

                return done( null, users[0] );

            }, function onRejected(reason){
                console.log('Rejection while fetching user data.')
                return done( reason );
            })
            

            .catch( (err)=>{console.log('Error while handling login request. '); return err} );

    } ) );

    function isPasswordValid(user, password){
        return password === user.password;
    }

    //++++++++++++++CONFIGURE SIGNUP AUTHENTICATION++++++++++++++++++++++
    passport.use(new LocalStrategy(function(username, password, done){} ) );

    passport.serializeUser( function(user:any, done){
        console.log('User serialized');
        done(null, user._id );
    } );

    passport.deserializeUser( function(id, done){
        stitchClient.login().then(function onFulfilled(){
            console.log('Successful deserialization');
            done(null, db.collection('Users').find( {_id:id} ) );
        }, 
        function onRejected( reason ){
            console.log('Rejected deserialization')
            done( reason );
        } )
        .catch( (err)=>{console.log('Deserializing error'); return err} );

    } );

}