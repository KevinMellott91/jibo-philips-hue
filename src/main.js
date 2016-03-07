"use strict";

let jibo = require('jibo');
let LightingController = require('./lighting/lighting-controller');
let ApplicationEmitter = require('./lighting/application-emitter');
let log4js = require('log4js');

let Status = jibo.bt.Status;
let blackboard = {};
let notepad = {};
let emitter = new ApplicationEmitter();

/**
 * Provides the main starting point for the Jibo skill.
 */
function start() {
    let root = jibo.bt.create('../behaviors/main', {
      blackboard: blackboard,
      notepad: notepad,
      emitter: emitter
    });
    root.start();
    let intervalId = setInterval(function() {
        if (root.status !== Status.IN_PROGRESS) {
            clearInterval(intervalId);
        }
        else {
            root.update();
        }
    }, 33);
}

/**
 * This code fires when Jibo initializes the skill. We essentially just need to initialize the
 * LightingController and ApplicationEmitter instances and associate them with the global
 * blackboard object. This allows the various Jibo behaviors to use functionality provided
 * by these classes, without needing to create another instance.
 */
jibo.init(function() {
    let eyeElement = document.getElementById('eye');
    jibo.visualize.createRobotRenderer(eyeElement, jibo.visualize.DisplayType.EYE);

    log4js.configure({
      appenders: [
        { type: 'console' }
    ]});
    blackboard.Logger = log4js.getLogger();
    blackboard.Logger.setLevel('TRACE');

    blackboard.LightingController = new LightingController();
    blackboard.LightingController.init(emitter, blackboard.Logger);

    start();
});
