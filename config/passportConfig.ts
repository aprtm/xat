import * as express from 'express';
import * as mdbStitch from 'mongodb-stitch';

import * as passport from 'passport';
import * as passportLocal from 'passport-local';

import * as bcrypt from 'bcrypt';

import { loginVerify } from './passport-strategies/login-local';
import { signupVerify } from './passport-strategies/signup-local';

import { loginVerifyDev } from './passport-strategies/login-localDev';
import { signupVerifyDev } from './passport-strategies/signup-localDev';

export function setup(){

    //++++++++++++++ SET UP SERIALIZATION ++++++++++++++++++++++
    passport.serializeUser( serialize );

    passport.deserializeUser( deserialize );

    let LocalStrategy = passportLocal.Strategy;

    //++++++++++++++ CONFIGURE LOGIN AUTHENTICATION ++++++++++++++++++++++
    if( process.env.OFFLINE ){
        passport.use('login-local', new LocalStrategy( loginVerifyDev ) );
    }else{
        passport.use('login-local', new LocalStrategy( loginVerify ) );
    }

    //++++++++++++++ CONFIGURE SIGNUP AUTHENTICATION ++++++++++++++++++++++
    if( process.env.OFFLINE ){
        passport.use('signup-local', new LocalStrategy({ passReqToCallback:true }, signupVerifyDev ) );
    }else{
        passport.use('signup-local', new LocalStrategy({ passReqToCallback:true }, signupVerify ) );
    }
    

    // //++++++++++++++ CONFIGURE CONVERSATIONS AUTHENTICATION ++++++++++++++++++++++
    // passport.use('conversation-local', new LocalStrategy({ passReqToCallback:true }, conversationVerify ) );

}


function serialize(user:any, connectCb){
    console.log('User serialized');
    connectCb(null, user._id );
}

// Get the client for the xat-mxymz app
const stitchClient:any = new mdbStitch.StitchClient( 'xat-mxymz' );
// get database instance from of a mongodb object with the XAT name
const db = stitchClient.service('mongodb', 'mongodb-atlas').db('XAT');

function deserialize(id, connectCb){

    stitchClient.login()

        .then(
            function onFulfilled(){
            console.log('Successful deserialization');
            return db.collection('Users').find( {_id:id} )
        }, 
        function onRejected( reason ){
            console.log('Rejected deserialization.')
            connectCb( reason );
        } )
        
        .then(
            function(users){
                connectCb(null,users[0])
            },
            function(reason){
                console.log('DB Find error')
                connectCb( reason );
            } )

        .catch( ( err )=>{console.log('Error deserializing.'); return err} );

}