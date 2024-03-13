# Hydra - A canvas-based VJ mixer

An extensible visual mixer using web technologies.

![Screenshot from 2024-02-17 22-24-36](https://github.com/n3uromanc3r/hydra/assets/111563/1bf9fd30-f635-4284-9200-9b55e355335b)

Available online at https://hydra.virusav.com/

### Features

- Crossfade visuals
- Multiple renderers (visuals)
  - Bars
  - Camera
  - Display
  - Lines
  - Lockdown (ported from https://lockdown.virusav.com)
  - Matrix
  - Neuromute (ported from https://neuromute.virusav.com)
  - Oscilloscope
  - Pink
  - Quark (ported from https://quark.virusav.com)
  - Strobe
  - Text
  - Video
  - Wave
- Visual blend/layer composition modes
  - Color-burn
  - Color-dodge
  - Color
  - Copy
  - Darken
  - Destination-atop
  - Destination-in
  - Destination-out
  - Destination-over
  - Difference
  - Exclusion
  - Hard-light
  - Hue
  - Lighten
  - Lighter
  - Luminosity
  - Multiply
  - Overlay
  - Saturation
  - Screen
  - Soft-light
  - Source-atop
  - Source-in
  - Source-out
  - Source-over
  - Xor
- Filters
  - Blur
  - Brightness
  - Contrast
  - Drop-shadow
  - Grayscale
  - Hue-rotate
  - Invert
  - Opacity
  - Saturate
  - Sepia
- Effects
  - Kaleidoscope
  - Mirror
    - Modes
      - Vert (vertical)
      - Hori (horizontal)
      - Quad (vertical & horizontal)
      - Layer (entire screen flipped vertical and overlaid with layer effect)
    - Start Positions
      - Bottom-Left
      - Top-Left
      - Top-Right
      - Bottom-Right
    - Layer Mode (Composition)
      - Color-burn
      - Color-dodge
      - Color
      - Copy
      - Darken
      - Destination-atop
      - Destination-in
      - Destination-out
      - Destination-over
      - Difference
      - Exclusion
      - Hard-light
      - Hue
      - Lighten
      - Lighter
      - Luminosity
      - Multiply
      - Overlay
      - Saturation
      - Screen
      - Soft-light
      - Source-atop
      - Source-in
      - Source-out
      - Source-over
      - Xor
- Audio Reactivity
  - Scale
  - Color
  - Alpha
  - Amp
- Audio source selection (TODO)
- Audio meter
  - Knightrider effect when not connected to source
- Multiple configurable and randomisable renderers (visuals)
- Presets
  - Import
  - Export
  - Send (share single preset configuration as JSON)
  - Receive (load single preset configuration from JSON)
  - Save (replace preset in bank for duration of session)
- Record output
- BPM detection
  - Tap to calculate using linear regression
  - Sync to set beat point using existing calculated BPM
- MIDI assignment for UI components
- Keyboard shortcuts (WIP)
- Theming
- Cast screens (deck 1, deck2 or mixed) to a popup windows
- Video output resolution configuration
- Extensible
- Free/Libre Open Source Software

## User Guide
Coming soon.  There's still some work to do to add a built-in help system, and to add a few roadmap features which will need documenting.

## Extending

#### Create a new renderer
To create a new renderer, you'll need to define a new renderer object and add it to the `hydra.renderers` properties.  This should be done _after_ the `hydra` script has been loaded, and _before_ the `hydra.boot` process has been called.

We'll start by adding a very basic example of a new renderer called `foomanchu`:
```
window.hydra.renderers['foomanchu'] = {
    init: function(deck) {
        const defaults = {};
        const ui = {};
        deck.foomanchu = window.hydra.renderer.init(deck, 'foomanchu', defaults, ui);

        deck.foomanchu.render = () => {

            const width = deck.canvas.width / 2;
            const height = deck.canvas.height / 2;

            const x = hydra.centerX - (width / 2);
            const y = hydra.centerY - (height / 2);

            deck.ctx.fillStyle = '#ff00e4';
            deck.ctx.fillRect(x, y, width, height);
        }

        return deck;
    }
};
```
In this basic example, we have defined our renderer object.  This has a single `init` method that has a `deck` object available to it.  

The `deck` has various properties available to it that can help us make more advanced renderers that react to playing audio and mouse movement (more on that later!).  

The `deck` also provides the `canvas` and `ctx` objects to our renderer, which we need in order to draw to our canvas.

Inside the `init` we then define the `defaults` and `ui` objects.

The `defaults` object is a place for setting default properties we may wish to assign, and for telling the deck what our `reactivity` options are.  For now we can ignore this.

The `ui` object is where we define any inputs/controls that the renderer should present to the end user in the interface, for now we can ignore this too.

Next, the `window.hydra.renderer.init` method is called, which is where a bunch of magic happens.  It is here that any user interface items we may have defined get `click` and `input` event handlers associated, and variable assignment to the renderer object also takes place here.

The heart of the renderer is our `render` method.  This is called every frame when the renderer is active, and draws our visual to the canvas.
In this example, we determine the canvas height and width and draw a pink rectangle that is half the size at the center of the screen.

Finally, we need to add our new renderer to the list of available renderers that hydra should use.  This list is defined in the `hydra.boot` object (see our new `foomanchu` addition to the `renderers` array):
```
hydra.boot({
    id: 'hydra',
    themes: [
        'default',
        'high-contrast',
    ],
    renderers: [
        'foomanchu',
        'lockdown',
        'matrix',
        'neuromute',
        'pink',
        'quark',
        'strobe',
    ],
    deck1: {
        visual: 'quark',
        preset: 3
    },
    deck2: {
        visual: 'lockdown',
        preset: 6
    }
});
```
At this point we can see the fruits of our labour in Hydra:
![Screenshot from 2024-03-02 14-52-21](https://github.com/n3uromanc3r/hydra/assets/111563/ae243123-59de-4892-b19a-85ae6d2eef59)

#### Adding UI components to our new renderer
Next up, let's add some inputs that allow us to control the look and feel of our newly added renderer.

We'll add 3 UI components:
- A `color` input to select the `color` of our rectangle
- A `range` input to adjust the `width` of our rectangle
- A `range` input to adjust the `height` of our rectangle

```
window.hydra.renderers['foomanchu'] = {
    init: function(deck) {
        const defaults = {};
        const ui = {
            fieldsets: [
                {
                    heading: 'Controls',
                    class: 'flex-grid',
                    attributes: 'data-columns="3"',
                    items: [
                        {
                            type: 'color',
                            label: 'Color',
                            variable: 'color',
                            value: '#ff00e4'
                        },
                        {
                            type: 'range',
                            label: 'Width',
                            variable: 'width',
                            min: 0,
                            max: 100,
                            value: 50,
                            step: 0.001,
                            randomiseable: true
                        },
                        {
                            type: 'range',
                            label: 'Height',
                            variable: 'height',
                            min: 0,
                            max: 100,
                            value: 50,
                            step: 0.001,
                            randomiseable: true
                        }
                    ]
                }
            ]
        };
        deck.foomanchu = window.hydra.renderer.init(deck, 'foomanchu', defaults, ui);

        deck.foomanchu.render = () => {

            const width = (deck.canvas.width / 100) * deck.foomanchu.width;
            const height = (deck.canvas.height / 100) *  deck.foomanchu.height;

            const x = hydra.centerX - (width / 2);
            const y = hydra.centerY - (height / 2);

            deck.ctx.fillStyle = `rgb(${deck.foomanchu.color.r}, ${deck.foomanchu.color.g}, ${deck.foomanchu.color.b})`;
            deck.ctx.fillRect(x, y, width, height);
        }

        return deck;
    }
};
```
Here we added a single fieldset with 3 inputs.

For each input we defined a `variable` (`color`, `width` and `height`). These variables can be accessed as: `deck.foomanchu.color`, `deck.foomanchu.width` and `deck.foomanchu.height` in our `render` method.

> **NOTE:** We can also access the `input` element for each of these like so: `deck.foomanchu.colorInput`, `deck.foomanchu.widthInput` and `deck.foomanchu.heightInput`.

We then adjusted our `render` method to make use of these new variables.

So now we can adjust the color of our rectangle, and change the width and height using the inputs on our `deck` interface!

https://github.com/n3uromanc3r/hydra/assets/111563/186a18ae-6712-4897-a7ae-64a30e1d9fd4

You'll also notice we added `randomiseable: true` to our `range` inputs.  This made these inputs default to reacting to `RANDOMISE` button on our deck.

https://github.com/n3uromanc3r/hydra/assets/111563/f2e4b4de-4aea-4210-839f-bad7b531ca30

#### Adding audio reactivity to our new renderer
Next up, we'll add some basic reactivity features to our renderer, by making the `scale` change in relation to the audio that is playing.
```
window.hydra.renderers['foomanchu'] = {
    init: function(deck) {
        const defaults = {
            reactivity: {
                scale: {
                    enabled: true,
                    on: true,
                    cause: 'average',
                    effect: 'add',
                    strength: 50
                }
            }
        };
        const ui = {
            fieldsets: [
                {
                    heading: 'Controls',
                    class: 'flex-grid',
                    attributes: 'data-columns="3"',
                    items: [
                        {
                            type: 'color',
                            label: 'Color',
                            variable: 'color',
                            value: '#ff00e4'
                        },
                        {
                            type: 'range',
                            label: 'Width',
                            variable: 'width',
                            min: 0,
                            max: 100,
                            value: 50,
                            step: 0.001,
                            randomiseable: true
                        },
                        {
                            type: 'range',
                            label: 'Height',
                            variable: 'height',
                            min: 0,
                            max: 100,
                            value: 50,
                            step: 0.001,
                            randomiseable: true
                        }
                    ]
                }
            ]
        };
        deck.foomanchu = window.hydra.renderer.init(deck, 'foomanchu', defaults, ui);

        deck.foomanchu.render = () => {

            let width = (deck.canvas.width / 100) * deck.foomanchu.width;
            let height = (deck.canvas.height / 100) *  deck.foomanchu.height;

            if (deck.reactivity.on && deck.reactivity.scale.on) {
                width = deck.reactivity.adjust('scale', width);
                height = deck.reactivity.adjust('scale', height);
            }

            const x = hydra.centerX - (width / 2);
            const y = hydra.centerY - (height / 2);

            deck.ctx.fillStyle = `rgb(${deck.foomanchu.color.r}, ${deck.foomanchu.color.g}, ${deck.foomanchu.color.b})`;
            deck.ctx.fillRect(x, y, width, height);
        }

        return deck;
    }
};
```
Here we defined some `reactivity` options in our `defaults` object.  This tells the deck that we want to enable scale reactivity.

We also modified the `render` method to utilise this functionality.

We first check to see if audio reaction is turned on (someone has pressed the 'REACT' button on the deck), by checking the `deck.reactivity.on` property is `true`.  We also check to see if reactivity scaling is turned on (`deck.reactivity.scale.on`).  If both of these properties are `true`, then we should make some scale adjustments.  These adjustments are easily applied using the `deck.reactivity.adjust` helper method.

In this instance, we have adjusted the `width` and `height` properties, like so:
```
width = deck.reactivity.adjust('scale', width);
height = deck.reactivity.adjust('scale', height);
```
Also take note that because we are re-assigning these variables, we have switched from using `const` to `let`.

We now have _reactivity!_

https://github.com/n3uromanc3r/hydra/assets/111563/e5e585a8-e9f4-4261-8e2c-ac52653b357c

## UI object
The `ui` object lets us define our renderers user interface components and layout.  Here is a quick overview of the properties for each type of object that can be defined in our `ui` structure:

#### Fieldsets

Type: `fieldset`
Properties:
- `heading` - optional - sets the fieldset heading 
- `class` - optional - sets the css class
- `attributes` - optional - can be used to set data-attributes and such
- `items` - optional - contains our input items


#### Items

Type: `checkbox`
Properties:
- `containerClass` - optional - sets the css class for the container
- `label` - optional - sets the label
- `checked` - optional - sets whether the input should be initially checked
- `class` - optional - sets the css class
- `variable` - required - sets the variable name
- `randomiseable` - optional - sets whether the input should default to randomiseable
- `disabled` - optional - sets whether the input should be initially disabled

Type: `range` or `number`
Properties:
- `containerClass` - optional - sets the css class for the container
- `label` - optional - sets the label
- `subLabel` - optional - sets the sub-label
- `value` - required - sets the initial value
- `type` - required - sets the type (`range` or  `number`)
- `min` - required - sets the min value
- `max` - required - sets the max value
- `step` - required - sets the step value
- `class` - optional - sets the css class
- `variable` - required - sets the variable name
- `randomiseable` - optional - sets whether the input should default to randomiseable
- `disabled` - optional - sets whether the input should be initially disabled
- `trigger` - optional - defines a method to call `onchange`
- `dispatchEvent` - optional - defines an event to dispatch `onchange`

Type: `color`
Properties:
- `containerClass` - optional - sets the css class for the container
- `label` - optional - sets the label
- `value` - required - sets the initial value
- `class` - optional - sets the css class
- `variable` - required - sets the variable name
- `randomiseable` - optional - sets whether the input should default to randomiseable
- `disabled` - optional - sets whether the input should be initially disabled

Type: `button`
Properties:
- `containerClass` - optional - sets the css class for the container
- `label` - optional - sets the label
- `text` - required - sets the initial text
- `class` - optional - sets the css class
- `variable` - required - sets the variable name
- `options` - required - defines what our options are that cycle when the button is clicked
- `randomiseable` - optional - sets whether the input should default to randomiseable
- `disabled` - optional - sets whether the input should be initially disabled
- `trigger` - optional - defines a method to call `onchange`

Type: `select`
Properties:
- `containerClass` - optional - sets the css class for the container
- `label` - optional - sets the label
- `class` - optional - sets the css class
- `variable` - required - sets the variable name
- `disabled` - optional - sets whether the input should be initially disabled
- `options` - required - define our dropdown options
  - `option.value` - required - set the value of an option
  - `option.selected` - optional - set the option to selected
  - `option.text` - required - set the option text

Type: `color-meter`
Properties:
- `containerClass` - optional - sets the css class for the container
- `label` - optional - sets the label
- `color` - required - set the color (css class name) e.g. `red`

Type: `file`
Properties:
- `containerClass` - optional - sets the css class for the container
- `label` - optional - sets the label
- `variable` - required - sets the variable name

Type: `textarea`
Properties:
- `containerClass` - optional - sets the css class for the container
- `label` - optional - sets the label
- `variable` - required - sets the variable name

Type: `empty`
Properties: **NA**

---
Ⓐ 🄯 
