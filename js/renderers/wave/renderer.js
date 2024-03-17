window.hydra.renderers['wave'] = {
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
                    heading: 'Color',
                    class: 'flex-grid',
                    attributes: 'data-columns="3"',
                    items: [
                        {
                            type: 'color',
                            label: 'Color',
                            variable: 'color',
                            value: '#ff0000',
                            randomiseable: true
                        },
                        {
                            type: 'button',
                            label: 'Wave Mode',
                            variable: 'waveColorMode',
                            text: 'selected',
                            options: 'selected,cycle',
                            randomiseable: true
                        }
                    ]
                },
                {
                    heading: 'Shape Properties',
                    class: 'flex-grid',
                    attributes: 'data-columns="2"',
                    items: [
                        {
                            type: 'range',
                            label: 'Radius',
                            variable: 'radius',
                            min: 0,
                            max: 100,
                            value: 15,
                            step: 1,
                            randomiseable: true
                        },
                        {
                            type: 'range',
                            label: 'Speed',
                            variable: 'speed',
                            min: 1,
                            max: 500,
                            value: 50,
                            step: 1,
                            randomiseable: true
                        }
                    ]
                },
                {
                    heading: 'Array',
                    class: 'flex-grid',
                    attributes: 'data-columns="2"',
                    items: [
                        {
                            type: 'range',
                            label: 'Columns',
                            variable: 'cols',
                            min: 0,
                            max: 40,
                            value: 20,
                            step: 1,
                            randomiseable: true
                        },
                        {
                            type: 'range',
                            label: 'Rows',
                            variable: 'rows',
                            min: 0,
                            max: 30,
                            value: 15,
                            step: 1,
                            randomiseable: true
                        }
                    ]
                },
                {
                    heading: 'Offset',
                    class: 'flex-grid',
                    attributes: 'data-columns="2"',
                    items: [
                        {
                            type: 'range',
                            label: 'Offset X',
                            variable: 'offsetX',
                            min: -500,
                            max: 500,
                            value: 0,
                            step: 1,
                            randomiseable: true
                        },
                        {
                            type: 'range',
                            label: 'Offset Y',
                            variable: 'offsetY',
                            min: -500,
                            max: 500,
                            value: 0,
                            step: 1,
                            randomiseable: true
                        }
                    ]
                },
                {
                    heading: 'Extra',
                    class: 'flex-grid',
                    attributes: 'data-columns="3"',
                    items: [
                        {
                            type: 'checkbox',
                            label: 'Clamp Distribution To Width',
                            variable: 'clampDistributionToWidth',
                            checked: true,
                            randomiseable: true
                        },
                        {
                            type: 'range',
                            label: 'Gap',
                            variable: 'gap',
                            min: 0,
                            max: 100,
                            value: 0,
                            step: 1,
                            randomiseable: true
                        }
                    ]
                }
            ]
        };
        deck.wave = window.hydra.renderer.init(deck, 'wave', {defaults, ui, presets: './js/renderers/wave/presets.json'});

        deck.wave.render = () => {
            let row = 0;
            let col = 0;
            let x;
            let y;
            for (let i = 1; i <= (parseInt(deck.wave.cols) * parseInt(deck.wave.rows)); i++) {

                let radius = hydra.helpers.sine((Date.now() + (i) * deck.wave.speed) / deck.wave.speed, (deck.wave.radius));

                if (deck.reactivity.on && deck.reactivity.scale.on) {
                    radius = deck.reactivity.adjust('scale', radius);
                }

                radius = radius * hydra.resolution.ratio;

                if (deck.wave.clampDistributionToWidth) {
                    x = ((deck.canvas.width / deck.wave.cols) * col) + deck.wave.radius;
                    y = ((deck.canvas.height / deck.wave.rows) * row) + deck.wave.radius;
                } else {
                    x = ((deck.wave.radius + deck.wave.gap) * col);
                    y = ((deck.wave.radius + deck.wave.gap) * row);
                }

                const r = deck.wave.waveColorMode == 'cycle' ? ((Math.sin(Date.now() / 5000) + 1) / 2) * 255 : deck.wave.color.r;
                const b = deck.wave.waveColorMode == 'cycle' ? ((Math.sin(Date.now() / 6000) + 1) / 2) * 255 : deck.wave.color.g;
                const g = deck.wave.waveColorMode == 'cycle' ? ((Math.sin(Date.now() / 7000) + 1) / 2) * 255 : deck.wave.color.b;

                deck.ctx.save();
                deck.ctx.beginPath();
                deck.ctx.arc(x + deck.wave.offsetX, y + deck.wave.offsetY, (radius > 0 ? radius : 0), 0, 2 * Math.PI, false);
                deck.ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
                deck.ctx.fill();
                deck.ctx.restore();

                col++;

                if (i % deck.wave.cols == 0) {
                    row++;
                    col = 0;
                }
            }
        }

        return deck;
    }
};