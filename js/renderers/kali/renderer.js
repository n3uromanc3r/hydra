window.hydra.renderers['kali'] = {
    init: function(deck) {
        const defaults = {
            reactivity: {
                scale: {
                    enabled: true,
                    on: true,
                    cause: 'average',
                    effect: 'add',
                    strength: 10
                },
                color: {
                    enabled: true,
                    on: true,
                    cause: 'average',
                    effect: 'add',
                    strength: 10
                },
                alpha: {
                    enabled: true,
                    on: true,
                    cause: 'average',
                    effect: 'add',
                    strength: 10
                },
                amp: {
                    enabled: false,
                    on: false,
                    cause: 'average',
                    effect: 'add',
                    strength: 10
                }
            }
        };
        const ui = {
            fieldsets: [
                {
                    heading: 'Color',
                    class: 'flex',
                    items: [
                        {
                            type: 'color',
                            label: 'Ring Color',
                            variable: 'ringColor',
                            value: '#33ee55',
                            randomiseable: true
                        },
                        {
                            type: 'color',
                            label: 'Background Color',
                            variable: 'backgroundColor',
                            value: '#000000',
                            randomiseable: true
                        }
                    ]
                },
                {
                    class: 'flex-grid',
                    attributes: 'data-columns="3"',
                    items: [
                        {
                            type: 'button',
                            label: 'Ring Color Mode',
                            variable: 'ringColorMode',
                            text: 'selected',
                            options: 'selected,cycle',
                            randomiseable: true
                        },
                        {
                            type: 'button',
                            label: 'Background Mode',
                            variable: 'bgColorMode',
                            text: 'selected',
                            options: 'selected,match,opposite',
                            randomiseable: true
                        }
                    ]
                },
                {
                    class: 'flex-grid',
                    attributes: 'data-columns="3"',
                    items: [
                        {
                            type: 'checkbox',
                            label: 'Shift On React',
                            variable: 'shiftOnReact',
                            checked: true,
                            randomiseable: true
                        },
                        {
                            type: 'checkbox',
                            label: 'Shift on Step',
                            variable: 'shiftOnStep',
                            checked: true,
                            randomiseable: true
                        },
                        {
                            type: 'checkbox',
                            label: 'Ring Stroke',
                            variable: 'ringStroke',
                            checked: false,
                            randomiseable: true
                        },
                        {
                            type: 'checkbox',
                            label: 'Ring Wave',
                            variable: 'ringWave',
                            checked: false,
                            randomiseable: true
                        }
                    ]
                },
                {
                    class: 'flex-grid',
                    attributes: 'data-columns="1"',
                    items: [
                        {
                            type: 'range',
                            label: 'Hue Shift',
                            variable: 'hueShift',
                            min: 0,
                            max: 360,
                            value: 0,
                            step: 1,
                            randomiseable: true
                        },
                        {
                            type: 'range',
                            label: 'Hue Shift Multiplier',
                            variable: 'hueShiftMultiplier',
                            min: 0.0001,
                            max: 10,
                            value: 1,
                            step: 0.0001,
                            randomiseable: true
                        }
                    ]
                },
                {
                    heading: 'Dimensions',
                    class: 'flex-grid',
                    attributes: 'data-columns="1"',
                    items: [
                        {
                            type: 'range',
                            label: 'Ring Count',
                            variable: 'ringCount',
                            min: 1,
                            max: 256,
                            value: 140,
                            step: 1,
                            randomiseable: true
                        },
                        {
                            type: 'range',
                            label: 'Ring Width',
                            variable: 'ringWidth',
                            min: 0.1,
                            max: 25,
                            value: 2.5,
                            step: 0.1,
                            randomiseable: true
                        },
                        {
                            type: 'range',
                            label: 'Ring Alpha',
                            variable: 'ringAlpha',
                            min: 0,
                            max: 1,
                            value: 1,
                            step: 0.001,
                            randomiseable: true
                        }
                    ]
                },
                {
                    class: 'flex-grid',
                    attributes: 'data-columns="1"',
                    items: [
                        {
                            type: 'checkbox',
                            label: 'Ring Log Enabled',
                            variable: 'ringLogEnabled',
                            checked: false,
                            randomiseable: true
                        }
                    ]
                },
                {
                    class: 'flex-grid',
                    attributes: 'data-columns="1"',
                    items: [
                        {
                            type: 'range',
                            label: 'Ring Log',
                            variable: 'ringLog',
                            min: 0,
                            max: 50,
                            value: 50,
                            step: 0.1,
                            randomiseable: true
                        },
                        {
                            type: 'range',
                            label: 'Ring Log Mod',
                            variable: 'ringLogMod',
                            min: 1,
                            max: 100,
                            value: 1,
                            step: 1,
                            randomiseable: true
                        },
                        {
                            type: 'range',
                            label: 'Wave Speed',
                            variable: 'waveSpeed',
                            min: 1,
                            max: 250,
                            value: 25,
                            step: 1,
                            randomiseable: true
                        },
                        {
                            type: 'range',
                            label: 'Ring Radius Mod',
                            variable: 'ringRadiusMod',
                            min: 1,
                            max: 100,
                            value: 10,
                            step: 1,
                            randomiseable: true
                        },
                        {
                            type: 'range',
                            label: 'Ring Width Mod',
                            variable: 'ringWidthMod',
                            min: 1,
                            max: 1000,
                            value: 100,
                            step: 1,
                            randomiseable: true
                        }
                    ]
                }
            ]
        };
        deck.kali = window.hydra.renderer.init(deck, 'kali', {defaults, ui, presets: './js/renderers/kali/presets.json'});

        deck.kali.render = () => {

            let ringWidth = (deck.canvas.width / deck.kali.ringCount) * deck.kali.ringWidth;

            let red = deck.kali.ringColorMode == 'cycle' ? ((Math.sin(Date.now() / 500) + 1) / 2) * 255 : deck.kali.ringColor.r;
            let green = deck.kali.ringColorMode == 'cycle' ? ((Math.sin(Date.now() / 850) + 1) / 2) * 255 : deck.kali.ringColor.g;
            let blue = deck.kali.ringColorMode == 'cycle' ? ((Math.sin(Date.now() / 1000) + 1) / 2) * 255 : deck.kali.ringColor.b;
            let ringAlpha;
            let ringRadius = deck.canvas.width / 2;
            let ringLog = deck.kali.ringLog;

            if (deck.kali.bgColorMode == 'selected') {
                deck.ctx.fillStyle = `rgb(${deck.kali.backgroundColor.r}, ${deck.kali.backgroundColor.g}, ${deck.kali.backgroundColor.b})`;
            } else if (deck.kali.bgColorMode == 'match') {
                deck.ctx.fillStyle = `rgba(${red}, ${green}, ${blue}, 0.2)`;
            } else {
                let bgR = 255 - red;
                let bgG = 255 - green;
                let bgB = 255 - blue;
                deck.ctx.fillStyle = `rgb(${bgR}, ${bgG}, ${bgB})`;
            }

            try {

                if (hydra.audio.listening && deck.reactivity.on) {
                    deck.kali.uint8Array = _.cloneDeep(hydra.audio.uint8Array);
                }

                const {r, g, b} = hydra.helpers.hueShift(red, green, blue, deck.kali.hueShift);

                red = r;
                green = g;
                blue = b;

                if (!deck.kali.shiftOnStep) {
                    const {r, g, b} = (hydra.audio.listening && deck.reactivity.on && deck.reactivity.color.on)
                        ? hydra.helpers.hueShift(red, green, blue, (1 * deck.kali.hueShiftMultiplier))
                        : {r: red, g: green, b: blue};

                    red = r;
                    green = g;
                    blue = b;

                    // shift hue multiplier to music
                    if (hydra.audio.listening && deck.reactivity.on && deck.reactivity.color.on  && deck.kali.shiftOnReact) {
                        const {r, g, b} = hydra.helpers.hueShift(red, green, blue, deck.kali.uint8Array[1]);
                        red = r;
                        green = g;
                        blue = b;
                    }
                }

                for (let i = 0; i < deck.kali.ringCount; i++) {

                    if (hydra.audio.listening && deck.reactivity.on && deck.reactivity.alpha.on) {
                        ringAlpha = deck.kali.ringAlpha * (deck.kali.uint8Array[i] / 100);
                    } else {
                        ringAlpha = deck.kali.ringAlpha;
                    }

                    if (deck.kali.shiftOnStep) {
                        const {r, g, b} = hydra.helpers.hueShift(red, green, blue, (i * deck.kali.hueShiftMultiplier));

                        red = r;
                        green = g;
                        blue = b;
                    }

                    // shift hue multiplier to music
                    if (hydra.audio.listening && deck.reactivity.on && deck.reactivity.color.on  && deck.kali.shiftOnReact) {
                        const {r, g, b} = hydra.helpers.hueShift(red, green, blue, deck.kali.uint8Array[i]);

                        red = r;
                        green = g;
                        blue = b;
                    }

                    if (!deck.kali.ringStroke && (i % 2 == 0)) {
                        deck.ctx.fillStyle = `rgb(0, 0, 0)`;
                    } else {
                        deck.ctx.fillStyle = `rgba(${red}, ${green}, ${blue}, ${ringAlpha})`;
                    }

                    if (deck.kali.ringWave && (i % 2 != 0)) {
                        let scaleModifier = hydra.helpers.sine((Date.now() + (i * deck.bars.waveSpeed)) / deck.kali.waveSpeed, deck.kali.ringCount);
                        ringWidth = ringWidth + (scaleModifier / deck.kali.ringWidthMod);
                        ringRadius = ringRadius + (scaleModifier / deck.kali.ringRadiusMod);
                    }

                    deck.ctx.save();
                    deck.ctx.beginPath();
                    deck.ctx.arc(hydra.centerX, hydra.centerY, (ringRadius > 0 ? ringRadius : 0), 0, 2 * Math.PI, false);
                    if (deck.kali.ringStroke ) {
                        deck.ctx.arc(hydra.centerX, hydra.centerY, (ringRadius - (ringWidth * 2) > 0 ? ringRadius - (ringWidth * 2) : 0), 0, 2 * Math.PI, true);
                    }
                    deck.ctx.fill();
                    deck.ctx.restore();

                    if ((i % 2 == 0) && deck.kali.fixedWidthGap)
                        ringRadius -= deck.kali.fixedWidthGapSize;
                    if (deck.kali.ringLogEnabled) {
                        if (hydra.audio.listening && deck.reactivity.on && deck.reactivity.scale.on) {
                            ringRadius -= (ringWidth * (deck.kali.uint8Array[i] / ringLog));
                        } else {
                            ringRadius -= (ringWidth * (100 / ringLog));
                        }
                    } else if (deck.kali.ringStroke) {
                        if (hydra.audio.listening && deck.reactivity.on && deck.reactivity.scale.on) {
                            ringRadius -= (ringWidth * (deck.kali.uint8Array[i] / 50));
                        } else {
                            ringRadius -= (ringWidth * 2);
                        }
                    } else {
                        if (hydra.audio.listening && deck.reactivity.on && deck.reactivity.scale.on) {
                            ringRadius -= (ringWidth * (deck.kali.uint8Array[i] / 100));
                            ringRadius -= ringWidth;
                        } else {
                            ringRadius -= ringWidth;
                        }
                    }

                    ringLog += (i * deck.kali.ringLogMod);

                }
            } catch (err) {
                console.log(err)
                // bad things happened
            }

        }

        return deck;
    }
};
