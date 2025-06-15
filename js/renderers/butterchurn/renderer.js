window.hydra.renderers['butterchurn'] = {
    init: function(deck) {
        const defaults = {
            clearsSelf: true,
            context: 'webgl2',
            managesOwnPresets: true,
            previousPreset: function(blendTime = 5.7) {
                let numPresets = deck.butterchurn.presetKeys.length;
                if (deck.butterchurn.presetIndexHist.length > 0) {
                    deck.butterchurn.presetIndex = deck.butterchurn.presetIndexHist.pop();
                } else {
                    deck.butterchurn.presetIndex = ((deck.butterchurn.presetIndex - 1) + numPresets) % numPresets;
                }
                deck.butterchurn.instance.loadPreset(deck.butterchurn.presets[deck.butterchurn.presetKeys[deck.butterchurn.presetIndex]], blendTime);
            },
            nextPreset: function(blendTime = 5.7) {
                deck.butterchurn.presetIndexHist.push(deck.butterchurn.presetIndex);
                var numPresets = deck.butterchurn.presetKeys.length;
                if (deck.butterchurn.presetRandom) {
                    deck.butterchurn.presetIndex = Math.floor(Math.random() * deck.butterchurn.presetKeys.length);
                } else {
                    deck.butterchurn.presetIndex = (deck.butterchurn.presetIndex + 1) % numPresets;
                }
                deck.butterchurn.instance.loadPreset(deck.butterchurn.presets[deck.butterchurn.presetKeys[deck.butterchurn.presetIndex]], blendTime);
            }
        };
        const ui = {

        };
        deck.butterchurn = window.hydra.renderer.init(deck, 'butterchurn', {defaults, ui});

        deck.butterchurn.initialised = false;
        deck.butterchurn.instance;
        deck.butterchurn.presets = {};
        deck.butterchurn.presetKeys = [];
        deck.butterchurn.presetIndexHist = [];
        deck.butterchurn.presetIndex = 0;

        deck.butterchurn.render = () => {

            if (deck.reactivity.on && hydra.audio.source) {
                if (!deck.butterchurn.initialised) {
                    deck.butterchurn.instance = butterchurn.createVisualizer(hydra.audio.context, deck.canvas, {
                        width: deck.canvas.width,
                        height: deck.canvas.height
                    });

                    deck.butterchurn.instance.connectAudio(hydra.audio.source);

                    // load a preset
                    Object.assign(deck.butterchurn.presets, butterchurnPresets.getPresets());
                    Object.assign(deck.butterchurn.presets, butterchurnPresetsExtra.getPresets());

                    deck.butterchurn.presets = _(deck.butterchurn.presets).toPairs().sortBy(([k, v]) => k.toLowerCase()).fromPairs().value();
                    deck.butterchurn.presetKeys = _.keys(deck.butterchurn.presets);
                    deck.butterchurn.presetIndex = Math.floor(Math.random() * deck.butterchurn.presetKeys.length);

                    deck.butterchurn.instance.loadPreset(deck.butterchurn.presets['Flexi, martin + geiss - dedicated to the sherwin maxawow'], 10); // 2nd argument is the number of seconds to blend presets

                    deck.butterchurn.initialised = true;
                }

                deck.butterchurn.instance.setRendererSize(deck.canvas.width, deck.canvas.height);

                deck.butterchurn.instance.render();
            }
        }

        return deck;
    }
};