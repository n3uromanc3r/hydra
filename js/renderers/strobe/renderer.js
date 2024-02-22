window.hydra.renderers['strobe'] = {
    init: function(deck) {
        const defaults = {
            scale: 0
        };
        const ui = {
            fieldsets: [
                {
                    heading: 'Shape',
                    class: 'flex-grid',
                    attributes: 'data-columns="1"',
                    items: [
                        {
                            type: 'select',
                            variable: 'shape',
                            options: [
                                {text: 'circle', value: 'circle', selected: true},
                                {text: 'rectangle', value: 'rectangle', selected: false},
                            ]
                        }
                    ]
                },
                {
                    heading: 'Mods',
                    class: 'flex',
                    items: [
                        {
                            type: 'checkbox',
                            label: 'Beat Sync',
                            variable: 'beatSync',
                            checked: true
                        },
                        {
                            type: 'color',
                            label: 'Color',
                            variable: 'color',
                            value: '#ffffff'
                        },
                        {
                            type: 'button',
                            label: 'Direction',
                            variable: 'direction',
                            text: 'forwards',
                            options: 'forwards,backwards'
                        }
                    ]
                },
                {
                    heading: 'Speed',
                    class: 'flex',
                    items: [
                        {
                            type: 'range',
                            label: 'Frequency',
                            variable: 'frequency',
                            min: 0,
                            max: 100,
                            value: 0,
                            step: 0.1,
                            containerClass: 'grow'
                        }
                    ]
                },
                {
                    class: 'flex',
                    items: [
                        {
                            type: 'range',
                            label: 'Interval',
                            variable: 'interval',
                            min: 0,
                            max: 100,
                            value: 20,
                            step: 0.1,
                            containerClass: 'grow'
                        },
                        {
                            type: 'range',
                            label: 'Acceleration',
                            variable: 'acceleration',
                            min: 0,
                            max: 0.6,
                            value: 0.1,
                            step: 0.001,
                            containerClass: 'grow'
                        }
                    ]
                },
            ]
        };
        deck.strobe = window.hydra.renderer.init(deck, 'strobe', defaults, ui);

        deck.strobe.render = () => {
            deck.ctx.clearRect(0, 0, deck.canvas.width, deck.canvas.height);

            const mod = deck.strobe.beatSync ? deck.strobe.acceleration : deck.strobe.acceleration * deck.strobe.frequency;

            if (deck.strobe.direction == 'backwards') {
                if ((deck.strobe.beatSync && hydra.audio.bpm.beatOn) || (!deck.strobe.beatSync && (deck.strobe.scale - 1.2) < -Math.abs(deck.strobe.interval))) {
                    deck.ctx.globalAlpha = 1;
                    deck.strobe.scale = 1.2;
                } else if (deck.strobe.scale < 1) {
                    deck.strobe.scale -= mod
                } else {
                    deck.ctx.globalAlpha = 0;
                    deck.strobe.scale -= mod
                }
            } else {
                if ((deck.strobe.beatSync && hydra.audio.bpm.beatOn) || (!deck.strobe.beatSync && deck.strobe.scale > deck.strobe.interval)) {
                    deck.ctx.globalAlpha = 1;
                    deck.strobe.scale = 0;
                } else if (deck.strobe.scale < 1) {
                    deck.strobe.scale += mod
                } else {
                    deck.ctx.globalAlpha = 0;
                    deck.strobe.scale += mod
                }
            }

            if (deck.strobe.shape == 'circle') {
                deck.ctx.save();
                const radius = deck.canvas.width * (deck.strobe.scale >= 0 ? deck.strobe.scale : 0);
                deck.ctx.fillStyle = `rgb(${deck.strobe.color.r}, ${deck.strobe.color.g}, ${deck.strobe.color.b})`;
                deck.ctx.beginPath();
                deck.ctx.arc(hydra.centerX, hydra.centerY, radius, 0, 2 * Math.PI);
                deck.ctx.fill();
                deck.ctx.restore();
            }

            if (deck.strobe.shape == 'rectangle') {
                deck.ctx.save();
                const width = deck.canvas.width * deck.strobe.scale;
                const height = deck.canvas.height * deck.strobe.scale;
                deck.ctx.fillStyle = `rgb(${deck.strobe.color.r}, ${deck.strobe.color.g}, ${deck.strobe.color.b})`;
                deck.ctx.fillRect(hydra.centerX - (width/2), hydra.centerY - (height/2), width, height);
                deck.ctx.restore();
            }
        }

        return deck;
    }
};