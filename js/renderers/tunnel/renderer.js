window.hydra.renderers['tunnel'] = {
    init: function(deck) {
        const defaults = {
            reactivity: {
                scale: {
                    enabled: true,
                    on: true,
                    cause: 'average',
                    effect: 'add',
                    strength: 50
                },
                color: {
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
                        }
                    ]
                },
                {
                    heading: 'Shape Properties',
                    class: 'flex-grid',
                    attributes: 'data-columns="1"',
                    items: [
                        {
                            type: 'range',
                            label: 'Points',
                            variable: 'points',
                            min: 0,
                            max: 360,
                            value: 3,
                            step: 1,
                            randomiseable: true
                        },
                        {
                            type: 'range',
                            label: 'Line Width',
                            variable: 'lineWidth',
                            min: 0,
                            max: 30,
                            value: 1,
                            step: 1,
                            randomiseable: true
                        }
                    ]
                }
            ]
        };
        deck.tunnel = window.hydra.renderer.init(deck, 'tunnel', {defaults, ui, presets: './js/renderers/tunnel/presets.json'});

        deck.tunnel.render = () => {
            deck.ctx.translate(0, 0);

            let iterations = deck.tunnel.points;
            let red = deck.tunnel.color.r;
            let green = deck.tunnel.color.g;
            let blue = deck.tunnel.color.b;

            if (deck.reactivity.on && deck.reactivity.scale.on) {
                iterations = deck.reactivity.adjust('scale', iterations / 50);
            }

            let alpha = 0.5;

            for (let i = 0; i < iterations; i++) {
                deck.ctx.save();

                deck.ctx.translate(hydra.centerX, hydra.centerY);

                const degree = i * (360 / iterations);
                const rotationInRadians = degree * Math.PI / 180;
                deck.ctx.rotate(rotationInRadians);

                alpha = hydra.helpers.sine((Date.now() + (i) * 5000) / 5000, alpha);

                if (true) {
                    red = (0.5 * (1 + Math.sin(2 * Math.PI * (0.00002 * 0.8) * (Date.now() - (i * 10))))) * 212;
                    green = (0.5 * (1 + Math.sin(2 * Math.PI * (0.00003 * 1.2) * (Date.now() - (i * 10))))) * 241;
                    blue = (0.5 * (1 + Math.sin(2 * Math.PI * (0.00004 * 1) * (Date.now() - (i * 10))))) * 202;

                    red = red - (iterations - i);
                    green = green - (iterations - i);
                    blue = blue - (iterations - i);

                    if (deck.reactivity.on && deck.reactivity.color.on) {
                        red = deck.reactivity.adjust('color', red);
                    }
                }

                deck.ctx.strokeStyle = `rgba(${red}, ${green}, ${blue}, ${alpha + 0.5})`;

                let lineWidth = deck.tunnel.lineWidth;

                if (deck.reactivity.on && deck.reactivity.scale.on) {
                    lineWidth = deck.reactivity.adjust('scale', lineWidth);
                }
                deck.ctx.lineWidth = lineWidth == 0 ? 0.0001 : lineWidth;
                // deck.ctx.lineWidth = deck.tunnel.lineWidth;

                deck.ctx.beginPath();
                deck.ctx.moveTo(0, 0);
                deck.ctx.lineTo(0, -3000);
                deck.ctx.stroke();

                deck.ctx.restore();
            }
        }

        return deck;
    }
};