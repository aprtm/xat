import * as express from 'express';
import * as mdbStitch from 'mongodb-stitch';

import * as passport from 'passport';

let router = express.Router();

router.post('/', function done( req, res, next ){
    req.logout();
    console.log('Logged out');
    return res.send( 'no user' );
});

export default router;