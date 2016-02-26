import jibo from 'jibo';
import LightingController from './lighting/lighting-controller';
import ApplicationEmitter from './lighting/application-emitter';
import log4js from 'log4js';

let {Status, factory} = jibo.bt;
let blackboard = {};
let notepad = {};

/**
 * Provides the main starting point for the Jibo skill.
 */
function start() {
    let root = factory.create('../behaviors/main', {
      blackboard: blackboard,
      notepad: notepad
    });
    root.start();
    let intervalId = setInterval(() => {
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
jibo.init().then(() => {
    require('./behaviors/debug-behavior');
    require('./lighting/lighting-controller');
    require('./lighting/application-emitter');

    let eyeElement = document.getElementById('eye');
    jibo.visualize.createRobotRenderer(eyeElement, jibo.visualize.DisplayType.EYE);

    log4js.configure({
      appenders: [
        { type: 'console' }
    ]});
    blackboard.Logger = log4js.getLogger();
    blackboard.Logger.setLevel('TRACE');

    const applicationEmitter = new ApplicationEmitter();
    blackboard.Emitter = applicationEmitter;

    blackboard.LightingController = new LightingController();
    blackboard.LightingController.init(blackboard.Emitter, blackboard.Logger);

    start();
}).catch(e => {
    console.error(e);
});
