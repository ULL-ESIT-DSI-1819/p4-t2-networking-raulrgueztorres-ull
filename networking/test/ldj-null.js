/** @author Raul Rodriguez Torres*/
'use strict'

const assert = require('assert');
const LDJClient = require('../lib/ldj-client.js');
const EventEmitter = require('events').EventEmitter;

/* Test unitario que capta un error al pasarle un elemento nulo al constructor*/
describe('LDJClient', () => {

  	it('Error creating a object with NULL param', done  => { 
		assert.throws( () => { new LDJClient(null);});
		done();
	});

});

