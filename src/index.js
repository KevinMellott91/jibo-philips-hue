'use strict';

const jibo = require('jibo');
const LightingController = require('./lighting/lighting-controller');
const ApplicationEmitter = require('./lighting/application-emitter');
const log4js = require('log4js');
log4js.configure({
  appenders: [{
    type: 'console',
    layout: {
      type: 'pattern',
      pattern: '[%d{ABSOLUTE}] [%p]:%n%m%n',
    },
  }],
});

const Status = jibo.bt.Status;
const blackboard = {};
const notepad = {};

function setupBlackboard() {
  blackboard.Logger = log4js.getLogger();
  blackboard.Logger.setLevel('TRACE');

  const applicationEmitter = new ApplicationEmitter();
  blackboard.Emitter = applicationEmitter;

  blackboard.LightingController = new LightingController();
  blackboard.LightingController.init(blackboard.Emitter, blackboard.Logger);
}

/**
 * Provides the main starting point for the Jibo skill.
 */
function start() {
  const root = jibo.bt.create('../../behaviors/main', {
    blackboard,
    notepad,
  });
  root.start();
  const intervalId = setInterval(() => {
    if (root.status !== Status.IN_PROGRESS) {
      clearInterval(intervalId);
    } else {
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
jibo.init().then(() => {
  const eyeElement = document.getElementById('eye');
  jibo.visualize.createRobotRenderer(
    eyeElement,
    jibo.visualize.DisplayType.EYE,
    () => {
      setupBlackboard();
      start();
    }
  );
  console.info('Jibo Started');
}).catch((e) => {
  console.error(`index.jibo.init().then: Fallthrough Error:\n${e}`);
});
