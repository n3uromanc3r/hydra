window.hydra.renderers['foomanchu'] = {
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
                    heading: 'Controls',
                    class: 'flex-grid',
                    attributes: 'data-columns="3"',
                    items: [
                        {
                            type: 'color',
                            label: 'Color',
                            variable: 'color',
                            value: '#ff00e4'
                        },
                        {
                            type: 'range',
                            label: 'Width',
                            variable: 'width',
                            min: 0,
                            max: 100,
                            value: 50,
                            step: 0.001,
                            randomiseable: true
                        },
                        {
                            type: 'range',
                            label: 'Height',
                            variable: 'height',
                            min: 0,
                            max: 100,
                            value: 50,
                            step: 0.001,
                            randomiseable: true
                        }
                    ]
                }
            ]
        };
        deck.foomanchu = window.hydra.renderer.init(deck, 'foomanchu', {defaults, ui});

        deck.foomanchu.render = () => {

            let width = (deck.canvas.width / 100) * deck.foomanchu.width;
            let height = (deck.canvas.height / 100) *  deck.foomanchu.height;

            if (deck.reactivity.on && deck.reactivity.scale.on) {
                width = deck.reactivity.adjust('scale', width);
                height = deck.reactivity.adjust('scale', height);
            }

            const x = hydra.centerX - (width / 2);
            const y = hydra.centerY - (height / 2);

            deck.ctx.fillStyle = `rgb(${deck.foomanchu.color.r}, ${deck.foomanchu.color.g}, ${deck.foomanchu.color.b})`;
            deck.ctx.fillRect(x, y, width, height);
        }

        return deck;
    }
};