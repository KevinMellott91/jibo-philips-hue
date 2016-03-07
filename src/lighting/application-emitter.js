"use strict";

let EventEmitter = require('events');

/**
 * This custom event emitter is created to allow the program code to respond to events within the system.
 */
class ApplicationEmitter extends EventEmitter {}

module.exports = ApplicationEmitter;
