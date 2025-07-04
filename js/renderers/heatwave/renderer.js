window.hydra.renderers['heatwave'] = {
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
                    on: false,
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
            },
            clearsSelf: true
        };
        const ui = {
            fieldsets: [
                {
                    heading: 'Color',
                    class: 'flex-grid',
                    attributes: 'data-columns="4"',
                    items: [
                        {
                            type: 'color',
                            label: 'Color',
                            variable: 'color',
                            value: '#ff0000',
                            randomiseable: true
                        },
                        {
                            type: 'checkbox',
                            label: 'Cycle Color',
                            variable: 'cycleColor',
                            checked: true,
                            randomiseable: true
                        }
                    ]
                },
                {
                    heading: 'Color Frequencies',
                    class: 'flex-grid',
                    attributes: 'data-columns="3"',
                    items: [
                        {
                            type: 'range',
                            label: 'Cycle Speed - R',
                            variable: 'cycleSpeedR',
                            min: 1,
                            max: 2000,
                            value: 500,
                            step: 1,
                            randomiseable: true
                        },
                        {
                            type: 'range',
                            label: 'Cycle Speed - G',
                            variable: 'cycleSpeedG',
                            min: 1,
                            max: 2000,
                            value: 850,
                            step: 1,
                            randomiseable: true
                        },
                        {
                            type: 'range',
                            label: 'Cycle Speed - B',
                            variable: 'cycleSpeedB',
                            min: 1,
                            max: 2000,
                            value: 1000,
                            step: 1,
                            randomiseable: true
                        }
                    ]
                },
                {
                    heading: 'Zebra',
                    class: 'flex-grid',
                    attributes: 'data-columns="3"',
                    items: [
                        {
                            type: 'checkbox',
                            label: 'Zebra Enabled',
                            variable: 'zebra',
                            checked: false,
                            randomiseable: true
                        },
                        {
                            type: 'range',
                            label: 'Zebra Start',
                            variable: 'zebraStart',
                            min: 0,
                            max: 100,
                            value: 10,
                            step: 1,
                            randomiseable: true
                        },
                        {
                            type: 'range',
                            label: 'Zebra For',
                            variable: 'zebraFor',
                            min: 0,
                            max: 100,
                            value: 10,
                            step: 1,
                            randomiseable: true
                        },
                    ]
                },
                {
                    heading: 'Fade',
                    class: 'flex',
                    attributes: 'data-columns="2"',
                    items: [
                        {
                            type: 'checkbox',
                            label: 'Fade Enabled',
                            variable: 'fade',
                            checked: true,
                            randomiseable: true
                        },
                        {
                            type: 'range',
                            label: 'Fade Time',
                            variable: 'fadeTime',
                            min: 0,
                            max: 1,
                            value: 0.005,
                            step: 0.001,
                            containerClass: 'grow',
                            randomiseable: true
                        },
                    ]
                },
                {
                    heading: 'Rotation',
                    class: 'flex-grid',
                    attributes: 'data-columns="4"',
                    items: [
                        {
                            type: 'checkbox',
                            label: 'Rotate',
                            variable: 'rotate',
                            checked: true,
                            randomiseable: true
                        },
                        {
                            type: 'checkbox',
                            label: 'Mix',
                            variable: 'mix',
                            checked: false,
                            randomiseable: true
                        },
                        {
                            type: 'checkbox',
                            label: 'Center Rotation',
                            variable: 'centerRotation',
                            checked: true,
                            randomiseable: true
                        },
                        {
                            type: 'checkbox',
                            label: 'Alternate Rotation',
                            variable: 'alternateRotation',
                            checked: true,
                            randomiseable: true
                        },
                    ]
                },
                {
                    class: 'flex-grid',
                    attributes: 'data-columns="4"',
                    items: [
                        {
                            type: 'range',
                            label: 'X',
                            variable: 'rotationX',
                            min: 1,
                            max: 100,
                            value: 0,
                            step: 0.001,
                            randomiseable: true
                        },
                        {
                            type: 'range',
                            label: 'Y',
                            variable: 'rotationY',
                            min: 1,
                            max: 100,
                            value: 0,
                            step: 0.001,
                            randomiseable: true
                        },
                        {
                            type: 'range',
                            label: 'Speed',
                            variable: 'rotationSpeed',
                            min: 1,
                            max: 5000,
                            value: 5000,
                            step: 1,
                            randomiseable: true
                        },
                        {
                            type: 'range',
                            label: 'Max',
                            variable: 'rotationMax',
                            min: 1,
                            max: 3600,
                            value: 360,
                            step: 1,
                            randomiseable: true
                        }
                    ]
                },
                {
                    heading: 'Dimensions',
                    class: 'flex-grid',
                    attributes: 'data-columns="3"',
                    items: [
                        {
                            type: 'range',
                            label: 'Width',
                            variable: 'width',
                            min: 1,
                            max: 100,
                            value: 1,
                            step: 1,
                            randomiseable: true
                        },
                        {
                            type: 'range',
                            label: 'Gap',
                            variable: 'gap',
                            min: 1,
                            max: 50,
                            value: 10,
                            step: 1,
                            randomiseable: true
                        }
                    ]
                },
                {
                    heading: 'Wave',
                    class: 'flex-grid',
                    attributes: 'data-columns="3"',
                    items: [
                        {
                            type: 'checkbox',
                            label: 'Width Adjust',
                            variable: 'widthAdjust',
                            checked: true,
                            randomiseable: true
                        },
                        {
                            type: 'range',
                            label: 'Wave Speed',
                            variable: 'speed',
                            min: 1,
                            max: 2000,
                            value: 1,
                            step: 1,
                            randomiseable: true
                        }
                    ]
                },
                {
                    heading: 'Line Count',
                    class: 'flex-grid',
                    attributes: 'data-columns="2"',
                    items: [
                        {
                            type: 'checkbox',
                            label: 'Auto-Detect Line Count',
                            variable: 'autoDetectLineCount',
                            checked: true,
                            randomiseable: true
                        },
                        {
                            type: 'range',
                            label: 'Line Count',
                            variable: 'lineCount',
                            min: 1,
                            max: 250,
                            value: 1,
                            step: 1,
                            randomiseable: true
                        }
                    ]
                }
            ]
        };
        deck.heatwave = window.hydra.renderer.init(deck, 'heatwave', {defaults, ui, presets: './js/renderers/heatwave/presets.json'});

        deck.heatwave.render = () => {

            let x;
            let y;
            let width;
            let height;
            let degree;
            let rotationX;
            let rotationY;
            let zebraOn;
            let r;
            let g;
            let b;

            let count = parseInt(deck.heatwave.autoDetectLineCount ? (deck.canvas.width / (deck.heatwave.width + deck.heatwave.gap) * 2) : deck.heatwave.lineCount);
            let countTotal = count;

            for (count; count >= 0; count--) {

                if (deck.heatwave.fade) {
                    deck.ctx.fillStyle = `rgba(0, 0, 0, ${deck.heatwave.fadeTime})`;
                    deck.ctx.fillRect(0, 0, deck.canvas.width, deck.canvas.height);
                }

                x = (count - 1) * (deck.heatwave.width + deck.heatwave.gap);
                y = 0;

                if (deck.heatwave.widthAdjust) {
                    width = hydra.helpers.sine((Date.now() + (count * deck.heatwave.speed)) / deck.heatwave.speed, deck.heatwave.width);
                } else {
                    width = deck.heatwave.width;
                }

                if (deck.reactivity.on && deck.reactivity.scale.on) {
                    width = width/500;
                    if (deck.reactivity.scale.effect == 'add') {
                        width = Math.max(0, width + (hydra.audio[deck.reactivity.scale.cause] * deck.reactivity.scale.strength/10));
                    }
                    if (deck.reactivity.scale.effect == 'subtract') {
                        width = Math.max(0, width - (hydra.audio[deck.reactivity.scale.cause] * deck.reactivity.scale.strength/10));
                    }
                    if (deck.reactivity.scale.effect == 'multiply') {
                        width = Math.max(0, width * (hydra.audio[deck.reactivity.scale.cause] * (deck.reactivity.scale.strength/10)));
                    }
                }

                height = deck.canvas.height;

                deck.ctx.save();

                if (deck.heatwave.rotate && (!deck.heatwave.mix || (deck.heatwave.mix && (count < (countTotal/2))))) {
                    degree = Math.abs(Math.sin(count + (Date.now() / deck.heatwave.rotationSpeed)) * deck.heatwave.rotationMax);
                    let rotationInRadians = degree * Math.PI / 180;

                    if (deck.heatwave.centerRotation) {
                        deck.ctx.translate(hydra.centerX, hydra.centerY);
                    } else {
                        rotationX = (deck.canvas.width / 100) * deck.heatwave.rotationX;
                        rotationY = (deck.canvas.height / 100) * deck.heatwave.rotationY;
                        deck.ctx.translate(rotationX, rotationY);
                    }

                    if (deck.heatwave.alternateRotation) {
                        deck.ctx.rotate(count %2 == 0 ? rotationInRadians : -rotationInRadians);
                    } else {
                        deck.ctx.rotate(rotationInRadians);
                    }
                }

                x = hydra.helpers.sine((Date.now() + (count * deck.heatwave.speed)) / deck.heatwave.speed, x);

                if (deck.heatwave.zebra) {
                    if (count % deck.heatwave.zebraStart == 0) {
                        zebraOn = deck.heatwave.zebraFor;
                    } else if (zebraOn > 0) {
                        zebraOn--;
                    } else {
                        zebraOn = false;
                    }
                } else {
                    zebraOn = false;
                }

                if (zebraOn) {
                    r = 0;
                    g = 0;
                    b = 0;
                } else {
                    r = deck.heatwave.cycleColor ? ((Math.sin(Date.now() / deck.heatwave.cycleSpeedR) + 1) / 2) * 255 : deck.heatwave.color.r;
                    g = deck.heatwave.cycleColor ? ((Math.sin(Date.now() / deck.heatwave.cycleSpeedG) + 1) / 2) * 255 : deck.heatwave.color.g;
                    b = deck.heatwave.cycleColor ? ((Math.sin(Date.now() / deck.heatwave.cycleSpeedB) + 1) / 2) * 255 : deck.heatwave.color.b;
                }

                deck.ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
                deck.ctx.fillRect(x, y, width, height);

                deck.ctx.restore();
            }
        }

        return deck;
    }
};