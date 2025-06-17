window.hydra.renderers['butterchurn'] = {
    init: function(deck) {
        const defaults = {
            clearsSelf: true,
            context: 'webgl2',
            managesOwnPresets: true,
            previousPreset: function(blendTime = 5.7) {
                let currentPreset = document.querySelector(`select[data-deck="${deck.id}"][data-visual="butterchurn"][data-variable="preset"]`).value;
                let currentPresetIndex = deck.butterchurn.presetKeys.indexOf(currentPreset);

                if (currentPresetIndex > 0) {
                    previous = deck.butterchurn.presetKeys[currentPresetIndex - 1];
                } else {
                    previous = deck.butterchurn.presetKeys[deck.butterchurn.presetKeys.length - 1];
                }


                deck.butterchurn.instance.loadPreset(deck.butterchurn.presets[previous], blendTime);
                document.querySelector(`select[data-deck="${deck.id}"][data-visual="butterchurn"][data-variable="preset"]`).value = previous;
            },
            nextPreset: function(blendTime = 5.7) {
                let currentPreset = document.querySelector(`select[data-deck="${deck.id}"][data-visual="butterchurn"][data-variable="preset"]`).value;
                let currentPresetIndex = deck.butterchurn.presetKeys.indexOf(currentPreset);

                if (currentPresetIndex < (deck.butterchurn.presetKeys.length - 1)) {
                    next = deck.butterchurn.presetKeys[currentPresetIndex + 1];
                } else {
                    next = deck.butterchurn.presetKeys[0];
                }

                deck.butterchurn.instance.loadPreset(deck.butterchurn.presets[next], blendTime);
                document.querySelector(`select[data-deck="${deck.id}"][data-visual="butterchurn"][data-variable="preset"]`).value = next;
            }
        };

        let presets = {};
        let presetKeys = {};
        let defaultPreset = 'Flexi, martin + geiss - dedicated to the sherwin maxawow';

        Object.assign(presets, butterchurnPresets.getPresets());
        Object.assign(presets, butterchurnPresetsExtra.getPresets());

        presets = _(presets).toPairs().sortBy(([k, v]) => k.toLowerCase()).fromPairs().value();
        presetKeys = _.keys(presets);

        let options = Object.entries(presets).map(function(preset) {
            return {text: preset[0], value: preset[0], selected: preset[0] === defaultPreset};
        });

        const ui = {
            fieldsets: [
                {
                    heading: 'Presets',
                    class: 'flex-grid',
                    attributes: 'data-columns="1"',
                    items: [
                        {
                            type: 'select',
                            variable: 'preset',
                            options: options
                        }
                    ]
                },
            ]
        };

        deck.butterchurn = window.hydra.renderer.init(deck, 'butterchurn', {defaults, ui});

        deck.butterchurn.initialised = false;
        deck.butterchurn.instance;
        deck.butterchurn.presets = presets;
        deck.butterchurn.presetKeys = presetKeys;

        document.querySelector(`select[data-deck="${deck.id}"][data-visual="butterchurn"][data-variable="preset"]`).addEventListener('change', function(e) {
            deck.butterchurn.instance.loadPreset(deck.butterchurn.presets[e.target.value], 10);
        });

        deck.butterchurn.render = () => {

            if (deck.reactivity.on && hydra.audio.source) {
                if (!deck.butterchurn.initialised) {
                    deck.butterchurn.instance = butterchurn.createVisualizer(hydra.audio.context, deck.canvas, {
                        width: deck.canvas.width,
                        height: deck.canvas.height
                    });

                    deck.butterchurn.instance.connectAudio(hydra.audio.source);

                    // load a preset
                    deck.butterchurn.instance.loadPreset(deck.butterchurn.presets[defaultPreset], 10); // 2nd argument is the number of seconds to blend presets

                    deck.butterchurn.initialised = true;
                }

                deck.butterchurn.instance.setRendererSize(deck.canvas.width, deck.canvas.height);

                deck.butterchurn.instance.render();
            }
        }

        return deck;
    }
};