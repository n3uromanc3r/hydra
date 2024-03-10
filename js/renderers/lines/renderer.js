window.hydra.renderers['lines'] = {
    init: function(deck) {
        const defaults = {
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
        deck.lines = window.hydra.renderer.init(deck, 'lines', defaults, ui, './js/renderers/lines/presets.json');

        deck.lines.render = () => {

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

            let count = parseInt(deck.lines.autoDetectLineCount ? (deck.canvas.width / (deck.lines.width + deck.lines.gap) * 2) : deck.lines.lineCount);
            let countTotal = count;

            for (count; count >= 0; count--) {

                if (deck.lines.fade) {
                    deck.ctx.fillStyle = `rgba(0, 0, 0, ${deck.lines.fadeTime})`;
                    deck.ctx.fillRect(0, 0, deck.canvas.width, deck.canvas.height);
                }

                x = (count - 1) * (deck.lines.width + deck.lines.gap);
                y = 0;

                if (deck.lines.widthAdjust) {
                    width = hydra.helpers.sine((Date.now() + (count * deck.lines.speed)) / deck.lines.speed, deck.lines.width);
                } else {
                    width = deck.lines.width;
                }

                height = deck.canvas.height;

                deck.ctx.save();

                if (deck.lines.rotate && (!deck.lines.mix || (deck.lines.mix && (count < (countTotal/2))))) {
                    degree = Math.abs(Math.sin(count + (Date.now() / deck.lines.rotationSpeed)) * deck.lines.rotationMax);
                    let rotationInRadians = degree * Math.PI / 180;

                    if (deck.lines.centerRotation) {
                        deck.ctx.translate(hydra.centerX, hydra.centerY);
                    } else {
                        rotationX = (deck.canvas.width / 100) * deck.lines.rotationX;
                        rotationY = (deck.canvas.height / 100) * deck.lines.rotationY;
                        deck.ctx.translate(rotationX, rotationY);
                    }

                    if (deck.lines.alternateRotation) {
                        deck.ctx.rotate(count %2 == 0 ? rotationInRadians : -rotationInRadians);
                    } else {
                        deck.ctx.rotate(rotationInRadians);
                    }
                }

                x = hydra.helpers.sine((Date.now() + (count * deck.lines.speed)) / deck.lines.speed, x);

                if (deck.lines.zebra) {
                    if (count % deck.lines.zebraStart == 0) {
                        zebraOn = deck.lines.zebraFor;
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
                    r = deck.lines.cycleColor ? ((Math.sin(Date.now() / deck.lines.cycleSpeedR) + 1) / 2) * 255 : deck.lines.color.r;
                    g = deck.lines.cycleColor ? ((Math.sin(Date.now() / deck.lines.cycleSpeedG) + 1) / 2) * 255 : deck.lines.color.g;
                    b = deck.lines.cycleColor ? ((Math.sin(Date.now() / deck.lines.cycleSpeedB) + 1) / 2) * 255 : deck.lines.color.b;
                }

                deck.ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
                deck.ctx.fillRect(x, y, width, height);

                deck.ctx.restore();
            }
        }

        return deck;
    }
};