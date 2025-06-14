window.hydra.renderers['neuromute'] = {
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
                    on: false,
                    cause: 'average',
                    effect: 'add',
                    strength: 10
                },
                alpha: {
                    enabled: true,
                    on: false,
                    cause: 'average',
                    effect: 'add',
                    strength: 10
                },
                amp: {
                    enabled: true,
                    on: false,
                    cause: 'average',
                    effect: 'add',
                    strength: 10
                }
            },
            trails: [],
            counter: 0,
            speed: 0.0001,
            red: 255,
            green: 255,
            blue: 255,
            canvas: deck.canvas,
            getRandomNumberBetween: (min, max) => {
                return Math.floor(Math.random() * (max - min + 1) + min);
            }
        };
        const ui = {
            fieldsets: [
                {
                    heading: 'Arc',
                    class: 'flex-grid',
                    attributes: 'data-columns="3"',
                    items: [
                        {
                            type: 'range',
                            label: 'Min Width',
                            variable: 'minWidth',
                            min: 1,
                            max: 596,
                            value: 1,
                            step: 1,
                            randomiseable: true
                        },
                        {
                            type: 'range',
                            label: 'Width Mode',
                            variable: 'widthMode',
                            min: 1,
                            max: 8,
                            value: 1,
                            step: 1,
                            randomiseable: true
                        },
                        {
                            type: 'range',
                            label: 'Mode',
                            variable: 'arcMode',
                            min: 1,
                            max: 12,
                            value: 1,
                            step: 1,
                            randomiseable: true
                        }
                    ]
                },
                {
                    heading: 'Line',
                    class: 'flex-grid',
                    attributes: 'data-columns="2"',
                    items: [
                        {
                            type: 'range',
                            label: 'Width',
                            variable: 'lineWidth',
                            min: 1,
                            max: 20,
                            value: 1,
                            step: 1,
                            randomiseable: true
                        },
                        {
                            type: 'range',
                            label: 'Mode',
                            variable: 'lineMode',
                            min: 1,
                            max: 3,
                            value: 1,
                            step: 1,
                            randomiseable: true
                        }
                    ]
                },
                {
                    heading: 'Trail',
                    class: 'flex-grid',
                    attributes: 'data-columns="2"',
                    items: [
                        {
                            type: 'range',
                            label: 'Length',
                            variable: 'trailLength',
                            min: 1,
                            max: 350,
                            value: 100,
                            step: 1,
                            randomiseable: true
                        },
                        {
                            type: 'range',
                            label: 'Modulo',
                            variable: 'modulo',
                            min: 1,
                            max: 20,
                            value: 1,
                            step: 1,
                            randomiseable: true
                        }
                    ]
                },
                {
                    heading: 'Fill',
                    class: 'flex-grid',
                    attributes: 'data-columns="3"',
                    items: [
                        {
                            type: 'range',
                            label: 'Frequency',
                            variable: 'fillFreq',
                            min: 1,
                            max: 200,
                            value: 1,
                            step: 1,
                            randomiseable: true
                        },
                        {
                            type: 'group',
                            class: 'inline-input',
                            items: [
                                {
                                    type: 'checkbox',
                                    label: 'Enabled',
                                    variable: 'fillMode',
                                    checked: false,
                                    randomiseable: true
                                },
                                {
                                    type: 'checkbox',
                                    label: 'Random',
                                    variable: 'fillRand',
                                    checked: false,
                                    randomiseable: true
                                }
                            ]
                        }
                    ]
                },
                {
                    heading: 'Dash',
                    class: 'flex-grid',
                    attributes: 'data-columns="3"',
                    items: [
                        {
                            type: 'range',
                            label: 'Length',
                            variable: 'dashLength',
                            min: 1,
                            max: 30,
                            value: 1,
                            step: 1,
                            randomiseable: true
                        },
                        {
                            type: 'range',
                            label: 'Gap',
                            variable: 'gapLength',
                            min: 1,
                            max: 100,
                            value: 1,
                            step: 1,
                            randomiseable: true
                        },
                        {
                            type: 'checkbox',
                            label: 'Enabled',
                            variable: 'dashMode',
                            checked: true,
                            randomiseable: true
                        }
                    ]
                },
                {
                    heading: 'Color - Global',
                    class: 'flex-grid',
                    attributes: 'data-columns="4"',
                    items: [
                        {
                            type: 'range',
                            label: 'Mode',
                            variable: 'colorMode',
                            min: 1,
                            max: 14,
                            value: 1,
                            step: 1,
                            randomiseable: true
                        },
                        {
                            type: 'range',
                            label: 'Shift',
                            variable: 'globalShift',
                            min: -255,
                            max: 255,
                            value: 0,
                            step: 1,
                            randomiseable: true
                        },
                        {
                            type: 'range',
                            label: 'Alpha',
                            variable: 'globalAlpha',
                            min: 0,
                            max: 1,
                            value: 1,
                            step: 0.01,
                            randomiseable: true
                        },
                        {
                            type: 'range',
                            label: 'Amp',
                            variable: 'globalAmp',
                            min: 0,
                            max: 20,
                            value: 1,
                            step: 0.1,
                            randomiseable: true
                        },
                    ]
                },
                {
                    heading: 'Red',
                    class: 'flex-grid',
                    attributes: 'data-columns="3"',
                    items: [
                        {
                            type: 'range',
                            label: 'Shift',
                            variable: 'redShift',
                            min: -255,
                            max: 255,
                            value: 0,
                            step: 1,
                            randomiseable: true
                        },
                        {
                            type: 'color-meter',
                            label: 'Level',
                            color: 'red'
                        },
                        {
                            type: 'range',
                            label: 'Amp',
                            variable: 'redAmp',
                            min: 0,
                            max: 20,
                            value: 1,
                            step: 0.1,
                            randomiseable: true
                        }
                    ]
                },
                {
                    heading: 'Green',
                    class: 'flex-grid',
                    attributes: 'data-columns="3"',
                    items: [
                        {
                            type: 'range',
                            label: 'Shift',
                            variable: 'greenShift',
                            min: -255,
                            max: 255,
                            value: 0,
                            step: 1,
                            randomiseable: true
                        },
                        {
                            type: 'color-meter',
                            label: 'Level',
                            color: 'green'
                        },
                        {
                            type: 'range',
                            label: 'Amp',
                            variable: 'greenAmp',
                            min: 0,
                            max: 20,
                            value: 1,
                            step: 0.1,
                            randomiseable: true
                        }
                    ]
                },
                {
                    heading: 'Blue',
                    class: 'flex-grid',
                    attributes: 'data-columns="3"',
                    items: [
                        {
                            type: 'range',
                            label: 'Shift',
                            variable: 'blueShift',
                            min: -255,
                            max: 255,
                            value: 0,
                            step: 1,
                            randomiseable: true
                        },
                        {
                            type: 'color-meter',
                            label: 'Level',
                            color: 'blue'
                        },
                        {
                            type: 'range',
                            label: 'Amp',
                            variable: 'blueAmp',
                            min: 0,
                            max: 20,
                            value: 1,
                            step: 0.1,
                            randomiseable: true
                        }
                    ]
                }
            ]
        };
        deck.neuromute = window.hydra.renderer.init(deck, 'neuromute', {defaults, ui, presets: './js/renderers/neuromute/presets.json'});

        deck.neuromute.redMeter = document.querySelector(`[data-deck="${deck.id}"][data-visual="neuromute"] .color-meter.red > div`);
        deck.neuromute.greenMeter = document.querySelector(`[data-deck="${deck.id}"][data-visual="neuromute"] .color-meter.green > div`);
        deck.neuromute.blueMeter = document.querySelector(`[data-deck="${deck.id}"][data-visual="neuromute"] .color-meter.blue > div`);

        deck.neuromute.render = () => {

            let opacity = 1;
            let angles;
            let trailLength = deck.neuromute.trailLength;
            let fillMode = deck.neuromute.fillMode;
            let globalShift = deck.neuromute.globalShift;
            let globalAlpha = deck.neuromute.globalAlpha * deck.alpha;
            let globalAmp = deck.neuromute.globalAmp;

            // bug in chrome means getBoundingClientRect on canvas returns 0 due to the use of flex, so workaround by finding closest column
            if (!deck.mouse.lockedPosition) {
                deck.neuromute.mouseX = (deck.mouse.x - deck.canvas.closest('.column').getBoundingClientRect().x - 10) * hydra.resolution.ratio;
                deck.neuromute.mouseY = (deck.mouse.y - deck.canvas.closest('.column').getBoundingClientRect().y - 10) * hydra.resolution.ratio;
            }

            if (deck.neuromute.counter > trailLength) {
                deck.neuromute.counter = 0;
            }

            deck.neuromute.counter++;

            if (deck.neuromute.trails.length >= trailLength) {
                deck.neuromute.trails.shift();

                // trailLength has been reduced
                if (deck.neuromute.trails.length > trailLength) {
                    deck.neuromute.trails.pop();
                }
            }

            switch (parseInt(deck.neuromute.colorMode)) {
                case 1:
                    deck.neuromute.red = deck.neuromute.counter;
                    deck.neuromute.green = (255-deck.neuromute.counter);
                    deck.neuromute.blue = parseInt((255/(255/deck.neuromute.mouseY) * (255/deck.neuromute.mouseX)));
                    opacity = parseInt(((trailLength*deck.neuromute.counter)));
                    opacity = 1;
                    break;
                case 2:
                    deck.neuromute.red = parseInt(hydra.helpers.sine(deck.neuromute.counter, 255));
                    deck.neuromute.green = (255-deck.neuromute.counter);
                    deck.neuromute.blue = parseInt((255/(255/deck.neuromute.mouseY) * (255/deck.neuromute.mouseX)));
                    break;
                case 3:
                    deck.neuromute.red = parseInt(hydra.helpers.sine(deck.neuromute.counter, trailLength));
                    deck.neuromute.green = parseInt(hydra.helpers.sine(deck.neuromute.counter, trailLength/2));
                    deck.neuromute.blue = parseInt(hydra.helpers.sine(deck.neuromute.counter, trailLength/3));
                    break;
                case 4:
                    deck.neuromute.red = parseInt(((deck.neuromute.mouseX/(deck.neuromute.canvas.width)) * 255));
                    deck.neuromute.green = parseInt(((deck.neuromute.mouseY/(deck.neuromute.canvas.height)) * 255));
                    deck.neuromute.blue = parseInt(hydra.helpers.sine(deck.neuromute.counter, trailLength));
                    break;
                case 5:
                    deck.neuromute.red = parseInt(hydra.helpers.sine(deck.neuromute.counter, 255));
                    deck.neuromute.green = parseInt(hydra.helpers.sine(deck.neuromute.counter, 155));
                    deck.neuromute.blue = parseInt(hydra.helpers.sine(deck.neuromute.counter, 55));
                    break;
                case 6:
                    deck.neuromute.red = deck.neuromute.counter*3;
                    deck.neuromute.green = 0;
                    deck.neuromute.blue = 0;
                    break;
                case 7:
                    deck.neuromute.red = 0;
                    deck.neuromute.green = deck.neuromute.counter*3;
                    deck.neuromute.blue = 0;
                    break;
                case 8:
                    deck.neuromute.red = 0;
                    deck.neuromute.green = 0;
                    deck.neuromute.blue = deck.neuromute.counter*3;
                    break;
                case 9:
                    deck.neuromute.red = parseInt(hydra.helpers.sine(deck.neuromute.counter, 255));
                    deck.neuromute.green = parseInt(hydra.helpers.sine(deck.neuromute.counter + 100, 255));
                    deck.neuromute.blue = parseInt(hydra.helpers.sine(deck.neuromute.counter + 200, 255));
                    break;
                case 10:
                    deck.neuromute.red = Math.sin(0.1*deck.neuromute.counter + 0) * 127 + 128;
                    deck.neuromute.green = Math.sin(0.1*deck.neuromute.counter + 2) * 127 + 128;
                    deck.neuromute.blue = Math.sin(0.1*deck.neuromute.counter + 4) * 127 + 128;
                    break;
                case 11:
                    deck.neuromute.red = Math.sin(0.05*deck.neuromute.counter + 0) * 127 + 128;
                    deck.neuromute.green = Math.sin(0.05*deck.neuromute.counter + 2) * 127 + 128;
                    deck.neuromute.blue = Math.sin(0.05*deck.neuromute.counter + 4) * 127 + 128;
                    break;
                case 12:
                    deck.neuromute.red = Math.sin(0.3*deck.neuromute.counter + 0) * 103 + 152;
                    deck.neuromute.green = Math.sin(0.3*deck.neuromute.counter + 2) * 103 + 152;
                    deck.neuromute.blue = Math.sin(0.3*deck.neuromute.counter + 4) * 103 + 152;
                    break;
                case 13:
                    deck.neuromute.red = Math.sin(0.1*deck.neuromute.counter + 0) * 103 + 152;
                    deck.neuromute.green = parseInt(hydra.helpers.sine(deck.neuromute.counter, 255));
                    deck.neuromute.blue = Math.sin(0.1*deck.neuromute.counter + 4) * 103 + 152;
                    break;
                case 14:
                    deck.neuromute.red = Math.sin((0.1*(deck.neuromute.counter/3)) + 0) * 127 + 128;
                    deck.neuromute.green = Math.sin((0.2*(deck.neuromute.counter/3)) + 2) * 115 + 140;
                    deck.neuromute.blue = Math.sin((0.3*(deck.neuromute.counter/3)) + 4) * 103 + 152;
                    break;
            }

            // update rgb displays before any potential reactor is applied, otherwise we're gonna have a bad time
            const redScaleX = Math.min(Math.max((1/255) * ((deck.neuromute.red + deck.neuromute.redShift + globalShift) * deck.neuromute.redAmp * globalAmp), 0), 1);
            const greenScaleX = Math.min(Math.max((1/255) * ((deck.neuromute.green + deck.neuromute.greenShift + globalShift) * deck.neuromute.greenAmp * globalAmp), 0), 1);
            const blueScaleX = Math.min(Math.max((1/255) * ((deck.neuromute.blue + deck.neuromute.blueShift + globalShift) * deck.neuromute.blueAmp * globalAmp), 0), 1);
            deck.neuromute.redMeter.style.transform = `scaleX(${redScaleX})`;
            deck.neuromute.greenMeter.style.transform = `scaleX(${greenScaleX})`;
            deck.neuromute.blueMeter.style.transform = `scaleX(${blueScaleX})`;


            // apply audio reactive shift and amp settings
            if (deck.reactivity.on) {
                if (deck.reactivity.color.on) {
                    if (deck.reactivity.color.effect == 'add') {
                        globalShift = globalShift + (hydra.audio[deck.reactivity.color.cause] * deck.reactivity.color.strength);
                    }
                    if (deck.reactivity.color.effect == 'subtract') {
                        globalShift = globalShift - (hydra.audio[deck.reactivity.color.cause] * deck.reactivity.color.strength);
                    }
                    if (deck.reactivity.color.effect == 'multiply') {
                        globalShift = (globalShift + (hydra.audio[deck.reactivity.color.cause] * deck.reactivity.color.strength)) * (hydra.audio[deck.reactivity.color.cause] * deck.reactivity.color.strength);
                    }
                }
                if (deck.reactivity.amp.on) {
                    if (deck.reactivity.amp.effect == 'add') {
                        globalAmp = Math.max(0, (globalAmp * deck.reactivity.amp.strength) + (hydra.audio[deck.reactivity.amp.cause] * (deck.reactivity.amp.strength)));
                    }
                    if (deck.reactivity.amp.effect == 'subtract') {
                        globalAmp = Math.max(0, globalAmp - ((((100/150) * hydra.audio[deck.reactivity.amp.cause]) * deck.reactivity.amp.strength)/100));
                    }
                    if (deck.reactivity.amp.effect == 'multiply') {
                        globalAmp = Math.max(0, (globalAmp/10) + ((globalAmp * hydra.audio[deck.reactivity.amp.cause]) * (deck.reactivity.amp.strength/10)));
                    }
                }
            }

            // handle color shift
            deck.neuromute.red = deck.neuromute.red + deck.neuromute.redShift;
            deck.neuromute.green = deck.neuromute.green + deck.neuromute.greenShift;
            deck.neuromute.blue = deck.neuromute.blue + deck.neuromute.blueShift;

            // handle global shift (cycles, unlike r/g/b shifts)
            if (globalShift) {
                deck.neuromute.red = deck.neuromute.red + globalShift;
                deck.neuromute.green = deck.neuromute.green + globalShift;
                deck.neuromute.blue = deck.neuromute.blue + globalShift;

                deck.neuromute.red = deck.neuromute.red % 255;
                deck.neuromute.green = deck.neuromute.green % 255;
                deck.neuromute.blue = deck.neuromute.blue % 255;

                if (Math.sign(deck.neuromute.red) == -1) {
                    deck.neuromute.red = 255 - deck.neuromute.red;
                }

                if (Math.sign(deck.neuromute.green) == -1) {
                    deck.neuromute.green = 255 - deck.neuromute.green;
                }

                if (Math.sign(deck.neuromute.blue) == -1) {
                    deck.neuromute.blue = 255 - deck.neuromute.blue;
                }
            }

            // handle color amp
            deck.neuromute.red = deck.neuromute.red * deck.neuromute.redAmp * globalAmp;
            deck.neuromute.green = deck.neuromute.green * deck.neuromute.greenAmp * globalAmp;
            deck.neuromute.blue = deck.neuromute.blue * deck.neuromute.blueAmp * globalAmp;

            const colorMode = 'rgba(' + deck.neuromute.red + ',' + deck.neuromute.green + ',' + deck.neuromute.blue + ',' + opacity + ')';

            if (deck.neuromute.arcMode == 7) {
                deck.neuromute.arcMode = deck.neuromute.getRandomNumberBetween(1,6);
            }

            // determine arc mode
            switch (deck.neuromute.arcMode) {
                case 1:
                    angles = {
                        start: 0,
                        end: (2 * Math.PI)
                    };
                    break;
                case 2:
                    angles = {
                        start: hydra.helpers.sine(deck.neuromute.counter, 360),
                        end: (hydra.helpers.sine(deck.neuromute.counter, 360) + 2)
                    };
                    break;
                case 3:
                    angles = {
                        start: Math.PI,
                        end: (2 * Math.PI)
                    };
                    break;
                case 4:
                    angles = {
                        start: hydra.helpers.sine(deck.neuromute.counter, 2 * Math.PI),
                        end: (hydra.helpers.sine(deck.neuromute.counter, 2 * Math.PI) + 0.3)
                    };
                    break;
                case 5:
                    angles = {
                        start: (1.25 * Math.PI),
                        end: (1.75 * Math.PI)
                    };
                    break;
                case 6:
                    angles = {
                        start: hydra.helpers.sine(deck.neuromute.counter, 2 * Math.PI),
                        end: (hydra.helpers.sine(deck.neuromute.counter, 2 * Math.PI) + 0.1)
                    };
                    break;
                case 7:
                    angles = {
                        start: hydra.helpers.sine(deck.neuromute.counter, 2 * Math.PI),
                        end: (hydra.helpers.sine(deck.neuromute.counter, 2 * Math.PI) + 1)
                    };
                    break;
                case 8:
                    angles = {
                        start: 0,
                        end: (deck.neuromute.counter/trailLength) * (2 * Math.PI)
                    };
                    break;
                case 9:
                    angles = {
                        start: (trailLength/(2 * Math.PI)) * deck.neuromute.counter,
                        end: (deck.neuromute.counter/trailLength) * (2 * Math.PI)
                    };
                    break;
                case 10:
                    angles = {
                        start: (Math.PI/trailLength) * deck.neuromute.counter,
                        end: ((Math.PI/trailLength) * deck.neuromute.counter) + Math.PI
                    };
                    break;
                case 11:
                    angles = {
                        start: 0,
                        end: Math.sin(0.1 * Math.PI/deck.neuromute.counter) + 0.2
                    };
                    break;
                case 12:
                    angles = {
                        start: ((deck.neuromute.counter-1) * ((Math.PI)/trailLength)),
                        end: ((deck.neuromute.counter-1) * ((Math.PI*2)/trailLength))
                    };
                    break;
            }

            // determine overall fill configuration
            if (fillMode && deck.neuromute.fillRand) {
                fillMode = (deck.neuromute.getRandomNumberBetween(1, deck.neuromute.fillFreq) == 1);
            } else if (fillMode) {
                fillMode = deck.neuromute.counter % deck.neuromute.fillFreq == 0;
            }

            // determine lineMode
            switch (deck.neuromute.lineMode) {
                case 1:
                    deck.neuromute.lineMode = 'butt';
                    break;
                case 2:
                    deck.neuromute.lineMode = 'line';
                    break;
                case 3:
                    deck.neuromute.lineMode = 'square';
                    break;
            }

            // add our settings to the trails array
            deck.neuromute.trails.push({
                strokeStyle: colorMode,
                position: {
                    x: Math.floor(deck.neuromute.mouseX),
                    y: Math.floor(deck.neuromute.mouseY)
                },
                arcMode: deck.neuromute.arcMode,
                angles: angles,
                minWidth: deck.neuromute.minWidth,
                widthMode: deck.neuromute.widthMode,
                lineWidth: deck.neuromute.lineWidth,
                lineMode: deck.neuromute.lineMode,
                fillMode: fillMode,
                dashMode: deck.neuromute.dashMode,
                dashLength: deck.neuromute.dashLength,
                gapLength: deck.neuromute.gapLength,
            });

            // draw our trails
            for (let i = deck.neuromute.trails.length - 1; i >= 0; i--) {

                if (deck.neuromute.trails[i] === undefined) {
                    return;
                }

                if (deck.neuromute.trails[i].widthMode == 8) {
                    deck.neuromute.trails[i].widthMode = deck.neuromute.getRandomNumberBetween(1, 7);
                }

                // determine width mode
                switch (deck.neuromute.trails[i].widthMode) {
                    case 1:
                        deck.neuromute.width = hydra.helpers.sine(i, 40);
                        break;
                    case 2:
                        deck.neuromute.width = (i/3) > 0 ? (i/3) : 0;
                        break;
                    case 3:
                        deck.neuromute.width = hydra.helpers.sine(i, 60);
                        break;
                    case 4:
                        deck.neuromute.width = hydra.helpers.sine(i/2, deck.neuromute.trails.length);
                        break;
                    case 5:
                        deck.neuromute.width = deck.neuromute.minWidth;
                        break;
                    case 6:
                        deck.neuromute.width = (trailLength/2) - (hydra.helpers.sine(i, trailLength)/2);
                        break;
                    case 7:
                        deck.neuromute.width = trailLength - hydra.helpers.sine(i, trailLength);
                        break;
                }

                // apply min width setting
                deck.neuromute.width = deck.neuromute.width + deck.neuromute.trails[i].minWidth;

                // apply audio reactive width setting
                if (deck.reactivity.on && deck.reactivity.scale.on) {
                    if (deck.reactivity.scale.effect == 'add') {
                        deck.neuromute.width = Math.max(0, deck.neuromute.width + (hydra.audio[deck.reactivity.scale.cause] * deck.reactivity.scale.strength/10));
                    }
                    if (deck.reactivity.scale.effect == 'subtract') {
                        deck.neuromute.width = Math.max(0, deck.neuromute.width - (hydra.audio[deck.reactivity.scale.cause] * deck.reactivity.scale.strength/10));
                    }
                    if (deck.reactivity.scale.effect == 'multiply') {
                        deck.neuromute.width = Math.max(0, deck.neuromute.width * (hydra.audio[deck.reactivity.scale.cause] * (deck.reactivity.scale.strength/10)));
                    }
                }

                deck.neuromute.width = deck.neuromute.width * hydra.resolution.ratio;

                if (i % deck.neuromute.modulo == 0) {

                    deck.ctx.beginPath();
                    deck.ctx.lineWidth = deck.neuromute.trails[i].lineWidth;
                    deck.ctx.lineCap = deck.neuromute.trails[i].lineMode;
                    if (deck.neuromute.trails[i].dashMode) {
                        deck.ctx.setLineDash([deck.neuromute.trails[i].dashLength, deck.neuromute.trails[i].gapLength]);
                    } else {
                        deck.ctx.setLineDash([]);
                    }
                    deck.ctx.strokeStyle = deck.neuromute.trails[i].strokeStyle;
                    deck.ctx.arc(deck.neuromute.trails[i].position.x, deck.neuromute.trails[i].position.y, deck.neuromute.width, deck.neuromute.trails[i].angles.start, deck.neuromute.trails[i].angles.end);
                    deck.ctx.stroke();
                    if (deck.neuromute.trails[i].fillMode) {
                        deck.ctx.fillStyle = deck.neuromute.trails[i].strokeStyle;
                        deck.ctx.fill();
                    }

                    // apply audio reactive global alpha setting
                    if (deck.reactivity.on && deck.reactivity.alpha.on) {
                        if (deck.reactivity.alpha.effect == 'add') {
                            globalAlpha = Math.min(1, (hydra.audio[deck.reactivity.alpha.cause]/50) * deck.reactivity.alpha.strength) * deck.alpha;
                        }
                        if (deck.reactivity.alpha.effect == 'subtract') {
                            globalAlpha = Math.max(0, globalAlpha - ((((100/150) * hydra.audio[deck.reactivity.alpha.cause]) * deck.reactivity.alpha.strength)/100)) * deck.alpha;
                        }
                        if (deck.reactivity.alpha.effect == 'multipy') {
                            globalAlpha = Math.min(1, (Math.max(0, (globalAlpha/10) + ((globalAlpha * hydra.audio[deck.reactivity.alpha.cause]) * (deck.reactivity.alpha.strength/10))))) * deck.alpha;
                        }
                    }

                    deck.ctx.globalAlpha = globalAlpha * deck.crossfaderAlpha;

                }
            }
        }

        return deck;
    }
};
