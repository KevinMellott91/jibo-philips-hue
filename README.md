# Jibo Philips Hue
This example shows how [Philips Hue](http://www.developers.meethue.com) can be used within [Jibo](http://www.jibo.com) to allow a person to control lights within their home. Specifically, this Jibo skill uses the [node-hue-api](https://github.com/peter-murray/node-hue-api) framework written by [Peter Murray](https://github.com/peter-murray) to communicate with the Hue bridge.

## Example Usage
When running the application, the following interactions will occur. These are basic examples, and they could be improved upon by adding the ability for Jibo to control individual lights. For example, you could say "turn on the living room lights" if Jibo was told which one that was.

The first time you use the application, Jibo will ask you to press the Hue bridge's pairing button. This allows him to discover the smart bulbs within your home and should only occur once.

### Get Jibo's attention
<small>*[Jibo is idle, waiting for an interaction]*<br /></small>
**Human**: hey jibo<br />
<small>*[Jibo centers his focus, and indicates attention with a blue LED]*<br /></small>

### Turn on lights
**Human**: Turn on the lights<br />
<small>*[Jibo nods to indicate acknowledgement of the question]*<br /></small>
<small>*[Jibo uses node-hue-api to turn on all lights]*<br /></small>
<small>*[Jibo's blue LED turns off, and he re-enters idle mode]*<br /></small>

### Turn off lights
**Human**: Turn off the lights<br />
<small>*[Jibo nods to indicate acknowledgement of the question]*<br /></small>
<small>*[Jibo uses node-hue-api to turn off all lights]*<br /></small>
<small>*[Jibo's blue LED turns off, and he re-enters idle mode]*<br /></small>

### Dim lights
**Human**: Dim the lights<br />
<small>*[Jibo nods to indicate acknowledgement of the question]*<br /></small>
<small>*[Jibo uses node-hue-api to dim all lights]*<br /></small>
<small>*[Jibo's blue LED turns off, and he re-enters idle mode]*<br /></small>

### Connect to Philips Hue bridge
<small>*[Jibo uses node-hue-api to discover it is not connected to the Hue bridge]*<br /></small>
**Jibo**: Press and hold the button on your Philips Hue bridge. I'll let you know when I'm connected.<br />
<small>*[Human holds down the Philips Hue bridge button]*<br /></small>
<small>*[Jibo uses node-hue-api to connect to the Hue bridge]*<br /></small>
**Jibo**: I am connected to your lighting system. How can I help you today?<br />
<small>*[Jibo uses node-hue-api to turn on all lights]*<br /></small>

## Troubleshooting
Philips provides a [bridge detection page](https://www.meethue.com/api/nupnp), which will list information about the Hue bridges connected to your network. This page
is very useful if Jibo is having difficulty establishing a connection with your bridge.
