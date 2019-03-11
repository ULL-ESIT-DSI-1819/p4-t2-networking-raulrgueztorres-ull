/** @author Raul Rodriguez Torres*/
const assert = require('assert');
const EventEmitter = require('events').EventEmitter;
const LDJClient = require('../lib/ldj-client.js');

/** Test unitario que envia un mensaje no JSON*/
describe('LDJClient', () => {
	let stream = null;
	let client = null;

	beforeEach(() => {
		stream = new EventEmitter();
		client = new LDJClient(stream);
	});
	
	it('should throw a error message because its not a JSON text.', done => 	{	assert.throws( () => {
			stream.emit('data', 'Not JSON message\n');
		});
		done();
	});
});


