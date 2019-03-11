'use strict';

/*Empleamos la clase LDJClient que hemos creado para conectarnos*/
const netClient = require('net').connect({port: 60300});
const ldjClient = require('./lib/ldj-client.js').connect(netClient);

/*Escuchamos si recibimos un mensaje y lo procesamos**/
ldjClient.on('message', message => {
	if(message.type === 'watching') {
		console.log(`Now watching: ${message.file}`);
	} else if (message.type === 'changed') {
		console.log(`File changed: ${new Date(message.timestamp)}`);
	} else {
		throw Error(`Unrecognized message type: ${message.type}`);
	}
});
