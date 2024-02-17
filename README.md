# Hydra - A canvas-based VJ mixer

An extensible visual mixer using web technologies.

![Screenshot from 2024-02-17 22-24-36](https://github.com/n3uromanc3r/hydra/assets/111563/1bf9fd30-f635-4284-9200-9b55e355335b)

Available online at https://hydra.virusav.com/

### Features

- Crossfade visuals
- Visual blend/layer composition modes
- Filters
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
- Audio scource selection (TODO)
- Audio meter
  - Knightrider effect when not connected to source
- Multiple configurable and randomisable renderers (visuals)
- Presets
  - Import (TODO)
  - Export
  - Send (share single preset configuration as JSON)
  - Receive (load single preset configuration from JSON)
  - Save (replace preset in bank for duration of session)
- Record output
- BPM detection
  - Tap to calculate using linear regression
  - Sync to set beat point using existing calculated BPM
- MIDI assignment for UI components (TODO)
- Keyboard shortcuts (TODO)
- Theming (TODO)
- Stream via WebRTC (TODO)
- Extensible

## User Guide
Coming soon.  There's still some work to do to add a built-in help system, and to add a few roadmap features which will need documenting.

## Extending - Create New Renderers
Coming soon.  There's still some work to do to make the renderers inject their own markup, which will decouple the HTML from the standalone rendering component.  Once this is done, then a guide to building bolt-on renderers will be added.

---
Ⓐ 🄯 
