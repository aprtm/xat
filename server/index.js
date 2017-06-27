"use strict";
exports.__esModule = true;
var express = require("express");
var http = require("http");
var path = require("path");
var socketio = require("socket.io");
var webPort = 9999;
//web server
var app = express();
var server = http.createServer(app);
var io = socketio(server);
app.use(express.static(path.join(__dirname, '../node_modules')));
app.use(express.static(path.join(__dirname, 'dist')));
app.get('/', function (req, res) {
    // console.log('serve', path.join(__dirname, 'index.html') );
    // res.sendFile( path.join(__dirname, '../dist/index.html') );
    // res.end();
});
// app.get("/*", function( req, res){
//     console.log('Request object url: ', req.baseUrl );
// });
io.on('connection', function (socket) {
    console.log('A socket was opened. Client connected');
    socket.on('openSocket', function (data) { return console.log(data); });
});
app.listen(webPort, function () { return console.log('Listening to ', webPort); });
