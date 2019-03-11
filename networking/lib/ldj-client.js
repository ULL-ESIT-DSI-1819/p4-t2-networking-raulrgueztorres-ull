/*@author Raul Rodriguez Torres*/
'use strict'

/** Obtenemos EventEmitter del paquete events*/
const EventEmitter = require('events').EventEmitter;

/** Declaración de la clase LDJClient que hereda de EventEmitter*/
class LDJClient extends EventEmitter {
	/*Constructor de la clase
	* @param stream */
	constructor(stream) {
		super();
		let buffer = '';
		stream.on('data', data => {
			buffer += data;
			let boundary = buffer.indexOf('\n');
			while(boundary !== -1) {
				const input = buffer.substring(0, boundary);
				buffer = buffer.substring(boundary + 1);
                this.emit('message', JSON.parse(input)); 
				boundary = buffer.indexOf('\n');
			}
		});

		stream.on('close', () => {
			let buff = buffer.indexOf('\n');

			if(buff !== -1)
			{
				const input = buffer.substring(0,buff);
				this.emit('message' , JSON.parse(input));
				buffer = ''; 
			}
			else
			{
				throw "Error in close event";
			}
		});
	}

	

	static connect(stream) {
		return new LDJClient(stream);
	}
}
/* Exporta la clase LDJClient*/
module.exports = LDJClient;
