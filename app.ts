import * as http from 'http';
import * as path from 'path';

import * as express from 'express';
import * as logger from 'morgan';
import * as cookieParser from 'cookie-parser';
import * as bodyParser from 'body-parser';

import signup from './routes/signup';

let app = express();

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

//serve static files from ./client/dist
app.use(express.static(path.join(__dirname, 'client', 'dist')));

app.use('/api/signup', signup);

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