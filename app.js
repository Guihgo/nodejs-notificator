var express = require('express');
var app = express();
// var server = require('http').createServer(app);
const https = require('https');
const fs = require('fs');
const options = {
	key: fs.readFileSync('key.pem'),
	cert: fs.readFileSync('cert.pem')
}

var server = https.createServer(options, app)
var io = require('socket.io').listen(server);

connections = [];

server.listen(process.env.TRADE || 3001);
console.log('Server rodando...');
app.use(express.json())

app.use(function (req, res, next) {

	res.header("Access-Control-Allow-Origin", "*");

	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

	next();

});

app.get('/', function (req, res) {
	res.sendFile(__dirname + '/index.html');
});

app.post('/notifica', (req, res) => {
	io.sockets.emit('notificacao', req.body.data)
	res.send('ok')
})

app.post('/valor', (req, res) => {
	io.sockets.emit('valor', req.body.data)
	res.send('ok')
})

io.sockets.on('connection', function (socket) {
	connections.push(socket);
	console.log('%s sockets conectado(s)', connections.length);

	//OnDisconect
	socket.on('disconnect', function (data) {
		connections.splice(connections.indexOf(socket), 1);
		console.log('Um client desconectou...' + data);
		console.log('%s sockets conectado(s)', connections.length);
	});

	//Enviando msg
	socket.on('msgEnviada', function (data) {
		console.log(data);
		io.sockets.emit('postMsg', { msg: data })
	});
});