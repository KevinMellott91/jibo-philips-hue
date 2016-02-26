# Jibo Philips Hue
This example shows how [Philips Hue](http://www.developers.meethue.com) can be used within [Jibo](http://www.jibo.com) to allow a person to control lights within their home. Specifically, this Jibo skill uses the [node-hue-api](https://github.com/peter-murray/node-hue-api) framework written by [Peter Murray](https://github.com/peter-murray) to communicate with the Hue bridge.

## Prerequisites
Prior to using this Jibo application, the Philips Hue bridge must already been configured and connected to the lights within your home.

In order to control rooms of lights (ex: *Hey Jibo, turn on the lights in the living room*), the lights first need to be placed into a *group*. Although the [official Philips Hue app](http://www2.meethue.com/en-us/support) does not support this functionality, there are several alternative apps ([Huemote](http://huemoteapp.com) for iOS and [LampShade.io](http://lampshade.io) for Android) that will configure groups. Additionally, you can use the [Hue API Debug Tool](https://community.smartthings.com/t/philips-hue-groups-control-app/3455) to setup groups.

## Example Usage
When running the application, the following interactions will occur. The first time, Jibo will ask you to press the Hue bridge's pairing button. This allows him to connect to the Philips Hue bridge and should only occur once.

### Turn on/off all lights
**Human**: Jibo, turn the lights *on/off*<br />
<small>*[Jibo nods to indicate acknowledgement of the question]*<br /></small>
<small>*[Jibo uses node-hue-api to turn on/off all lights]*<br /></small>

### Dim all lights
**Human**: Jibo, dim the lights<br />
<small>*[Jibo nods to indicate acknowledgement of the question]*<br /></small>
<small>*[Jibo uses node-hue-api to dim all lights]*<br /></small>

### Turn on/off specific lights
**Human**: Jibo, turn *on/off* the lights in the *living room, bedroom, kitchen*<br />
<small>*[Jibo nods to indicate acknowledgement of the question]*<br /></small>
<small>*[Jibo uses node-hue-api to identify the desired lights and turn them on/off]*<br /></small>
**Jibo**: I've turned *on/off* the lights in the *living room, bedroom, kitchen*<br />

### Turn on all lights (night scenario)
**Human**: Jibo, it's getting dark<br />
**Jibo**: Would you like me to turn on the lights?<br />
**Human**: Yes<br />
<small>*[Jibo nods to indicate acknowledgement of the question]*<br /></small>
<small>*[Jibo uses node-hue-api to turn on all lights]*<br /></small>
**Jibo**: Oh, that's much better!<br />

### Turn off all lights (bedtime scenario)
**Human**: Jibo, I'm going to bed<br />
**Jibo**: Would you like me to turn off the lights in five minutes?<br />
**Human**: Yes<br />
<small>*[Jibo nods to indicate acknowledgement of the question]*<br /></small>
<small>*[Jibo uses node-hue-api to schedule all lights off in 5 minutes]*<br /></small>

### Turn on/off all lights (scheduling scenario)
**Human**: Jibo, could you turn *on/off* the lights at *5 pm* today?<br />
<small>*[Jibo nods to indicate acknowledgement of the question]*<br /></small>
**Jibo**: Certainly, I'll turn them *on/off* at *5 pm*<br />
<small>*[Jibo uses node-hue-api to schedule all lights on/off at 5pm]*<br /></small>

### Connect to Philips Hue bridge
<small>*[Jibo uses node-hue-api to discover it is not connected to the Hue bridge]*<br /></small>
**Jibo**: Press the button on your Philips Hue bridge and I'll let you know when I'm connected.<br />
<small>*[Human presses the Philips Hue bridge button]*<br /></small>
<small>*[Jibo uses node-hue-api to connect to the Hue bridge]*<br /></small>
**Jibo**: I am connected to your lighting system. How can I help you today?<br />

## Troubleshooting
Philips provides a [bridge detection page](https://www.meethue.com/api/nupnp), which will list information about the Hue bridges connected to your network. This page
is very useful if Jibo is having difficulty establishing a connection with your bridge.

The [Hue API Debug Tool](http://www.developers.meethue.com/documentation/getting-started) allows you to inspect the state of your light bulbs, which includes any schedule information.
