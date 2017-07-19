import * as http from 'http';
import * as path from 'path';

import * as express from 'express';
import * as expressSession from 'express-session';
import * as logger from 'morgan';
import * as cookieParser from 'cookie-parser';
import * as bodyParser from 'body-parser';

import * as passport from 'passport';
import passportInit from './config/passportConfig';

import signup from './routes/signup';
import login from './routes/login';
import logout from './routes/logout';

let app = express();

app.use( logger('dev') );
app.use( bodyParser.json() );
app.use( bodyParser.urlencoded( { extended: false } ) );
// app.use( cookieParser() );
app.use( expressSession( { 
    secret:'test secret',
    resave:false,
    saveUninitialized:true,
    cookie:{ secure:false } 
  }) 
);
app.use( passport.initialize() )
app.use( passport.session() );

//serve static files from ./client/dist
app.use(express.static(path.join(__dirname, 'client', 'dist')));

passportInit();

app.use('/api/signup', signup);
app.use('/api/login', login);
app.use('/api/logout', logout);

// routing testing
app.get('**', function(req,res){
    res.sendFile(path.join(__dirname, 'client', 'dist','index.html'));
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err:(Error&{status?:number}) = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.send('error ' + req.url );
});

module.exports = app;