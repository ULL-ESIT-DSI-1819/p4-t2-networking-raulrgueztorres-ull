'use strict'

const fs = require('fs');
const net = require('net');
const filename = process.argv[2];
/* Comprobamos que se introdujo nombre de fichero*/
if(!filename) {
	throw Error('Error: No filename specified.');
}
/* Establecemos la conexion y escuchamos por el puerto indicado*/
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
}).listen(60300, () => console.log('Listening for subscribers...'));
