import * as express from 'express'
import * as http from 'http'
import * as path from 'path';
import * as socketio from 'socket.io'

const webPort = 9999;

//web server
let app = express();
let server = http.createServer(app);
let io = socketio(server);

app.use(express.static( path.join(__dirname,'../node_modules') ));

app.use(express.static( path.join(__dirname,'../dist') ));

app.get('/', function( req, res ){
    console.log('serve', path.join(__dirname, 'index.html') );
    res.sendFile( path.join(__dirname, '../dist/index.html') );
    // res.end();
});

app.get("/*", function( req, res){
    console.log('Request object url: ', req.baseUrl );
});

io.on('connection', function(socket){
    console.log('A socket was opened. Client connected');

    socket.on('openSocket', (data)=>console.log(data));
});

app.listen( webPort, ()=> console.log('Listening to ', webPort) );