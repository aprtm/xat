import * as express from 'express';
import * as path from 'path';
import * as logger from 'morgan';
import * as cookieParser from 'cookie-parser'
import * as bodyParser from 'body-parser'

let app = express();

// app configuration
//logs server requests
app.use(logger('dev'));

//parse request body accordingly...
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

//serve static files from ./client/dist
app.use(express.static(path.join(__dirname, 'client', 'dist')));

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
  res.render('error');
});

module.exports = app;