'use strict'

const fs = require('fs');
const net = require('net');
const filename = process.argv[2];

/* Comprobamos que se introdujo un nombre de fichero*/
if(!filename) {
	throw Error('Error: No filename specified.');
}

/*Establecemos la conexion y escuchamos por el puerto indicado. Esta vez empleando wacher.sock de Unix*/
net.createServer( connection => {
	//Reporting.
	console.log('Subscriber connected.');
	connection.write(`Now watching "${filename}" for changes...\n`);

	//watcher setup.
	const watcher =
		fs.watch(filename, () => connection.write(`File changed: ${new Date()}\n`));

	//Cleanup.
	connection.on('close', () => {
		console.log('Subscriber disconnected.');
		watcher.close();
	});
}).listen('/tmp/watcher.sock', () => console.log('Listening for subscribers...'));
