window.hydra.renderers['text'] = {
    init: function(deck) {
        const defaults = {};
        const ui = {
            fieldsets: [
                {
                    heading: 'Text',
                    class: 'flex-grid',
                    attributes: 'data-columns="1"',
                    items: [
                        {
                            type: 'textarea',
                            variable: 'text'
                        }
                    ]
                },
                {
                    class: 'flex-grid',
                    attributes: 'data-columns="3"',
                    items: [
                        {
                            type: 'button',
                            label: 'Load',
                            variable: 'load',
                            options: ['Load'],
                            text: 'Load'
                        },,
                        {
                            type: 'select',
                            label: 'Font',
                            variable: 'font',
                            options: [],
                            randomiseable: true
                        },
                        {
                            type: 'range',
                            label: 'Size',
                            variable: 'size',
                            min: 0,
                            max: 200,
                            value: 30,
                            step: 1,
                            randomiseable: true
                        }
                    ]
                },
                {
                    class: 'flex-grid',
                    attributes: 'data-columns="2"',
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
                            label: 'Stroke',
                            variable: 'stroke',
                            checked: false,
                            randomiseable: true
                        }
                    ]
                },
                {
                    class: 'flex-grid',
                    attributes: 'data-columns="2"',
                    items: [
                        {
                            type: 'range',
                            label: 'Offset X',
                            variable: 'offsetX',
                            min: 0,
                            max: 100,
                            value: 0,
                            step: 0.001,
                            randomiseable: true
                        },
                        {
                            type: 'range',
                            label: 'Offset Y',
                            variable: 'offsetY',
                            min: 0,
                            max: 100,
                            value: 0,
                            step: 0.001,
                            randomiseable: true
                        }
                    ]
                }
            ]
        };
        deck.text = window.hydra.renderer.init(deck, 'text', {defaults, ui});

        deck.text.font = 'Arial';

        deck.text.loadInput.addEventListener('click', function(e) {
            (async () => {
                await navigator.permissions.query({name: 'local-fonts'});
                deck.text.fonts = await queryLocalFonts();

                deck.text.fonts.forEach(font => {
                    deck.text.fontInput.add(new Option(font.fullName, font.fullName));
                });
            })()
        })

        deck.text.render = () => {
            if (deck.text.textInput.value)  {

                deck.ctx.font = `${deck.text.size}px ${deck.text.font}`;

                const x = (deck.canvas.width / 100) * deck.text.offsetX;
                let y = ((deck.canvas.height / 100) * deck.text.offsetY) + deck.text.size;

                const lineHeight = deck.ctx.measureText('M').width * 1.2;
                const lines = deck.text.textInput.value.split("\n");

                if (deck.text.stroke) {
                    deck.ctx.strokeStyle = `rgb(${deck.text.color.r}, ${deck.text.color.g}, ${deck.text.color.b})`;

                    for (var i = 0; i < lines.length; ++i) {
                        deck.ctx.strokeText(lines[i], x, y);
                        y += lineHeight;
                    }
                } else {
                    deck.ctx.fillStyle = `rgb(${deck.text.color.r}, ${deck.text.color.g}, ${deck.text.color.b})`;

                    for (var i = 0; i < lines.length; ++i) {
                        deck.ctx.fillText(lines[i], x, y);
                        y += lineHeight;
                    }
                }
            }
        }

        return deck;
    }
};