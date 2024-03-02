# Hydra - A canvas-based VJ mixer

An extensible visual mixer using web technologies.

![Screenshot from 2024-02-17 22-24-36](https://github.com/n3uromanc3r/hydra/assets/111563/1bf9fd30-f635-4284-9200-9b55e355335b)

Available online at https://hydra.virusav.com/

### Features

- Crossfade visuals
- Multiple renderers (visuals)
  - Lockdown (ported from https://lockdown.virusav.com)
  - Matrix
  - Neuromute (ported from https://neuromute.virusav.com)
  - Pink
  - Quark (ported from https://quark.virusav.com)
  - Strobe
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
    - Clip (vertical)
    - Full (vertical & horizontal)
    - Bleed (vertical + overlay)
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
- MIDI assignment for UI components (WIP)
- Keyboard shortcuts (WIP)
- Theming
- Cast screens (deck 1, deck2 or mixed) to a popup windows
- Video output resolution configuration
- Extensible
- Free/Libre Open Source Software

## User Guide
Coming soon.  There's still some work to do to add a built-in help system, and to add a few roadmap features which will need documenting.

## Extending - Create New Renderers
Coming soon.  ~There's still some work to do to make the renderers inject their own markup, which will decouple the HTML from the standalone rendering component.  Once this is done, then a guide to building bolt-on renderers will be added.~ Renderers now inject their own markup!..  Guide on its way!

---
Ⓐ 🄯 
