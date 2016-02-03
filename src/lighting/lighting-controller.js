import Hue from 'node-hue-api';
import _ from 'lodash';
import fs from 'fs';
import nconf from 'nconf';

/**
 * Main class that allows the program to interact with the Philips Hue API, which
 * in turn controls lights within the home.
 */
class LightingController {
  /**
   * Initializes the variables within the lighting controller.
   * @param  {EventEmitter} emitter The emitter that should be used when publishing or consuming events.
   */
  init (emitter) {
    var _self = this;
    if (!_self.initialized) {
      _self.initialized = true;
      _self.connectionEstablished = false;
      _self.connectionInProgress = false;
      _self.connectionRetryAttempts = 0;
      _self.emitter = emitter;

      // Attempt to load the Hue bridge name.
      nconf.use('file', { file: 'config.json' });
      _self.hueBridgeUsername = nconf.get('hue:bridgeUsername');
    }
  }

  /**
   * Retrieves the username that was generated when the application paired with
   * the Hue bridge for the first time.
   * @return {string} Username that should be used when connecting to the Hue bridge.
   */
  getBridgeUsername() {
    var _self = this;
    return _self.hueBridgeUsername;
  }

  /**
   * Sets the username that should be used when communicating with the Hue bridge.
   * This value will be stored, so that the application only needs to be registered once.
   * @param {string} username Username that was generated when initially connecting to the Hue bridge.
   */
  setBridgeUsername(username) {
    var _self = this;

    // Update the values stored in the config file, so that this is remembered next time around.
    nconf.use('file', { file: 'config.json' });
    nconf.set('hue:bridgeUsername', username);
    nconf.save(function (err) {
      fs.readFile('config.json', function (err, data) {
        console.dir(JSON.parse(data.toString()))
      });
    });

    _self.hueBridgeUsername = username;
  }

  /**
   * Initializes the event handlers for the lighting controls, primarily around connection retry logic.
   */
  configureEvents() {
    var _self = this;
    console.log('Configuring lighting-controller events.');

    // Attempt to connect to the Hue bridge.
    _self.emitter.on('bridgeRetry', function(event){
      console.log("Retry attempt #%s to establish bridge connection.", _self.connectionRetryAttempts);
      _self.setupHueApi();
    });

    // Connection to the Hue bridge timed out.
    _self.emitter.on('bridgeTimeout', function(event){
      console.log("Retry timed out after %s attempts.", _self.connectionRetryAttempts);
      _self.connectionInProgress = false;
      _self.publishMessage('bridgeTimeout');
    });

    // Hue bridge was not detected on the network.
    _self.emitter.on('errorNoBridge', function(event){
      if(_self.connectionRetryAttempts === 0) {
        _self.publishMessage('errorNoBridge');
      }
      _self.attemptConnection();
    });

    // Hue bridge was detected, but this application is not registered.
    _self.emitter.on('errorNotRegistered', function(event){
      if(_self.connectionRetryAttempts === 0) {
        _self.publishMessage('errorNotRegistered');
      }
      _self.attemptConnection();
    });

    // Successful connection to the Hue bridge.
    _self.emitter.on('bridgeConnected', function(event){
      _self.publishMessage('bridgeConnected');

      // Update the tracking information.
      _self.connectionEstablished = true;
      _self.connectionRetryAttempts = 0;
    });
  }

  /**
   * Tracks the number of times a connection has been attempted, and triggers the event to try again.
   * Also determines when it is time to give up and trigger the timeout event.
   */
  attemptConnection() {
    var _self = this;

    // Update the tracking information.
    _self.connectionEstablished = false;
    _self.connectionRetryAttempts += 1;

    // If we haven't reached the retry limit, then try again after waiting a few seconds.
    if(_self.connectionRetryAttempts < 10) {
      setTimeout(function() {
        _self.emitter.emit('bridgeRetry');
      }, 6000);
    }
    else {
      _self.emitter.emit('bridgeTimeout');
    }
  }

  /**
   * Emits a message representing a given condition, which is meant to be communicated to the user.
   * @param  {string} eventType The type of event that has occurred.   */
  publishMessage(eventType) {
    var _self = this;
    var message = '';
    switch(eventType) {
      case 'errorNoBridge':
        message = _self.errorNoBridgePublished === true
          ? "Just a minute while I connect to your lighting system."
          : "I'm having trouble locating your Philips Hue bridge. Please check to see if the device is powered on and connected to your network.";
        _self.errorNoBridgePublished = true;
        break;
      case 'errorNotRegistered':
        message = _self.errorNotRegisteredPublished === true
          ? "Just a minute while I connect to your lighting system."
          : "Press the button on your Philips Hue bridge and I'll let you know when I'm connected.";
        _self.errorNotRegisteredPublished = true;
        break;
      case 'bridgeConnected':
        message = "I am connected to your lighting system. How can I help you today?";
        break;
      case 'bridgeTimeout':
        message = "I can't seem to connect to your bridge and am going to take a break. Let me know when you'd like me to try again.";
        break;
      case 'invalidCommand':
        message = "Sorry I didn't understand that. Perhaps you'd like me to turn the lights on or off, or to dim them?";
        break;
      case 'connectionInProgress':
        message = "Just a minute while I connect to your lighting system.";
        break;
    }
    _self.emitter.emit('userMessage', message);
  }

  /**
   * Creates a stub connection, which can be used when there are no Philips Hue bridges available to use.
   */
  setupFakeBridge() {
    var _self = this;
    console.log('setting up fake bridge connection.');
    _self.connectionInProgress = true;
    _self.authenticatedApi = Hue.api('192.168.1.8', 'newdeveloper');
    _self.emitter.emit('bridgeConnected');
  }

  /**
   * Creates an actual connection to a Philips Hue bridge, and triggers the necessary events for failure modes.
   */
  setupActualBridge() {
    var _self = this;
    _self.connectionInProgress = true;

    // Detect the Hue bridges within range.
    console.log('setting up actual bridge connection.');
    Hue.nupnpSearch()
      .then(function(bridges){
        // Example response:
        // Hue Bridges Found: [{"id":"001788fffe096103","ipaddress":"192.168.2.129","name":"Philips Hue","mac":"00:00:00:00:00"}]
        console.log('Hue Bridges Found: %s', JSON.stringify(bridges));

        // Ensure that we found bridges.
        if(bridges.length === 0)
          throw 'Did not detect any Hue bridges.';

        // Just use the first bridge that was discovered.
        // TODO: This should be updated to allow the user to choose the correct Hue bridge.
        var bridge = _.head(bridges);

        // Check to see if our application is already registered with this bridge.
        if(_self.getBridgeUsername()) {
          _self.authenticatedApi = new Hue.HueApi(bridge.ipaddress, _self.getBridgeUsername());
          _self.validateBridgeConnection();
        }
        else {
          // Otherwise, attempt to register the application.
          _self.registerApplication(bridge.ipaddress);
        }
      })
      .fail(function(error){
        // Could not communicate with the bridge.
        console.error(error);
        _self.emitter.emit('errorNoBridge');
      })
      .done();
  }

  /**
   * Connects to the Hue bridge using the established instance, to retrieve
   * basic configuration information. If the connection succeeds, then the
   * "bridgeConnected" event will be emitted.
   */
  validateBridgeConnection() {
    var _self = this;

    // Validate the connection by accessing basic information.
    _self.authenticatedApi.fullState()
      .then(function(data){
        _self.emitter.emit('bridgeConnected');
      })
      .fail(function(error){
        // Clear out the stored username.
        console.error(error);
        _self.authenticatedApi = undefined;
        _self.setBridgeUsername(undefined);
        _self.emitter.emit('errorNotRegistered');
      })
      .done();
  }

  /**
   * Establishes a username for the Jibo application on the Hue bridge. This
   * username will be stored for future use, to prevent re-registering.
   * @param  {string} ipAddress The IP address of the Hue bridge.
   */
  registerApplication(ipAddress) {
    var _self = this;
    var tempApi = new Hue.HueApi();

    tempApi.registerUser(ipAddress, 'jibo-philips-hue')
      .then(function(username){
        // Example response:
        // Existing device user found: 51780342fd7746f2fb4e65c30b91d7
        console.log('Device user found: %s', username);

        // Store the authenticated API.
        _self.setBridgeUsername(username);
        _self.authenticatedApi = new Hue.HueApi(ipAddress, _self.getBridgeUsername());
        _self.validateBridgeConnection();
      })
      .fail(function(error){
        // User is not registered with the device.
        console.error(error);
        _self.emitter.emit('errorNotRegistered');
      })
      .done();
  }

  /**
   * Establishes a connection to the Hue bridge, which can be a fake one (to support testing).
   */
  setupHueApi() {
    var _self = this;
    //_self.setupFakeBridge();
    _self.setupActualBridge();
  }

  /**
   * Triggers behavior within the Hue API, based on the provided action.
   * @param  {string} action The type of action to take (turn on lights, turn off lights, etc).
   */
  takeAction(action) {
    var _self = this;

    // If there is not a valid connection, then do not process the command.
    if(!_self.connectionEstablished) {
      // Trigger the retry workflow if it isn't already running.
      if(!_self.connectionInProgress) {
        console.log('Attempting connection to the Hue bridge.')
        _self.connectionRetryAttempts = 0;
        _self.setupHueApi();
      }
      else {
        _self.publishMessage('connectionInProgress');
      }
      return;
    }

    // Call the appropriate method, based on the incoming request.
    console.log('Received request for action: %s.', action);
    switch(action)
    {
      case 'on':
        _self.turnOnLights();
        break;
      case 'off':
        _self.turnOffLights();
        break;
      case 'dim':
        _self.dimLights();
        break;
      case 'connect':
        _self.setupHueApi();
        break;
      default:
        _self.publishMessage('invalidCommand');
        break;
    }
  }

  /**
   * Uses the Hue API to turn off all lights within range.
   */
  turnOffLights() {
    var _self = this;
    var lightState = Hue.lightState.create().off();

    console.log('Turning off the lights');
    _self.changeLightsState(lightState);
  }

  /**
   * Uses the Hue API to turn on all lights within range.
   */
  turnOnLights() {
    var _self = this;
    var lightState = Hue.lightState.create().on().brightness(100);

    console.log('Turning on the lights');
    _self.changeLightsState(lightState);
  }

  /**
   * Uses the Hue API to dim all lights within range. This is essentially changing the brightness of
   * each light to a mid-range value.
   */
  dimLights() {
    var _self = this;
    var lightState = Hue.lightState.create().on().brightness(30); // Available range is 0 - 100.

    console.log('Dimming the lights');
    _self.changeLightsState(lightState);
  }

  /**
   * Modifies the state of all lights that are accessible to the authenticated Hue bridge.
   * The light state object contains information about the change (brightness, on/off, etc.).
   * @param  {lightState} lightState Contains information about the desired light state. Available settings and helper API can be found at https://github.com/peter-murray/node-hue-api#using-lightstate-to-build-states.
   */
  changeLightsState(lightState) {
    var _self = this;
    _self.authenticatedApi.lights()
      .then(function(result){
        _.forEach(result.lights, function(light){
          _self.authenticatedApi.setLightState(light.id, lightState)
            .then(function(result){
              console.log('Attempted to change state of light #%s with result of "%s"', light.id, JSON.stringify(result, null, 2));
            })
            .fail(function(error){
              console.error(error);
            })
            .done();
        })
      })
      .fail(function(error){
        console.error(error);
      })
      .done();
  }
}

export default LightingController;
