'use strict'

const EventEmitter = require('events').EventEmitter;

class LDJClient extends EventEmitter {
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
/*	
	close(data) {
		buffer += data; 
		buffer += '\n';
		let boundary = buffer.indexOf('\n');
                while(boundary !== -1) {
                	const input = buffer.substring(0, boundary);
                        buffer = buffer.substring(boundary + 1);
                        this.emit('message', JSON.parse(input));
                        boundary = buffer.indexOf('\n');
		 }
	
	}*/
}

module.exports = LDJClient;
