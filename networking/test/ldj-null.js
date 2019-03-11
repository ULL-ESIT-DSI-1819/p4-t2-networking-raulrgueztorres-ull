'use strict'

const assert = require('assert');
const LDJClient = require('../lib/ldj-client.js');
const EventEmitter = require('events').EventEmitter;

describe('LDJClient', () => {
/*	let client = null;
	let stream = null;
    
	try { 
		client = new LDJClient(stream);
	}
	catch(error)
	{
		it('Error creating a object with NULL param', done => { done();});
	}*/
  	it('Error creating a object with NULL param', done  => { 
		assert.throws( () => { new LDJClient(null);});
		done();
	});

});

