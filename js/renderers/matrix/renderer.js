window.hydra.renderers['matrix'] = {
    init: function(deck) {
        const defaults = {
            clearsSelf: true,
            katakana: 'アァカサタナハマヤャラワガザダバパイィキシチニヒミリヰギジヂビピウゥクスツヌフムユュルグズブヅプエェケセテネヘメレヱゲゼデベペオォコソトノホモヨョロヲゴゾドボポヴッン',
            latin: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
            nums: '0123456789',
            columns: 0,
            rainDrops: [],
            rainbowColors: {
                current: 0,
                hexCodes: [
                    '#f01f3a',
                    '#f17e37',
                    '#ffe34f',
                    '#00a258',
                    '#0073b7',
                    '#002b8a',
                    '#a4228d'
                ]
            },
            calculatedAt: null,
            calculatedProperties: false,
            calculateProperties: () => {
                deck.matrix.alphabet = deck.matrix.customCharactersInput.value.length ? deck.matrix.customCharactersInput.value : deck.matrix.katakana + deck.matrix.latin + deck.matrix.nums;

                deck.matrix.columns = deck.canvas.width / deck.matrix.fontSize;

                for (let x = 0; x < deck.matrix.columns; x++) {
                    deck.matrix.rainDrops[x] = 1;
                }

                deck.matrix.calculatedProperties = true;
                deck.matrix.calculatedAt = deck.canvas.width;
            }
        };
        const ui = {
            fieldsets: [
                {
                    heading: 'Color',
                    class: 'flex-grid',
                    attributes: 'data-columns="1"',
                    items: [
                        {
                            type: 'buttonRadioSwitchGroup',
                            label: 'Character Mode',
                            variable: 'characterColorMode',
                            active: 'selected',
                            buttons: [
                                {
                                    text: 'selected',
                                    options: 'selected',
                                    randomiseable: true
                                },
                                {
                                    text: 'cycle',
                                    options: 'cycle',
                                    randomiseable: true
                                },
                                {
                                    text: 'rainbow',
                                    options: 'rainbow',
                                    randomiseable: true
                                }
                            ],
                        }
                    ]
                },
                {
                    class: 'flex',
                    items: [
                        {
                            type: 'color',
                            label: 'Character Color',
                            variable: 'characterColor',
                            value: '#00ff00',
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
                    heading: 'Color Frequencies',
                    class: 'flex-grid',
                    attributes: 'data-columns="3"',
                    items: [
                        {
                            type: 'range',
                            label: 'Cycle Speed - R',
                            variable: 'cycleSpeedR',
                            min: 1,
                            max: 20000,
                            value: 500,
                            step: 1,
                            randomiseable: true
                        },
                        {
                            type: 'range',
                            label: 'Cycle Speed - G',
                            variable: 'cycleSpeedG',
                            min: 1,
                            max: 20000,
                            value: 850,
                            step: 1,
                            randomiseable: true
                        },
                        {
                            type: 'range',
                            label: 'Cycle Speed - B',
                            variable: 'cycleSpeedB',
                            min: 1,
                            max: 20000,
                            value: 1000,
                            step: 1,
                            randomiseable: true
                        }
                    ]
                },
                {
                    heading: 'Font',
                    class: 'flex-grid',
                    attributes: 'data-columns="1"',
                    items: [
                        {
                            type: 'range',
                            label: 'Size',
                            variable: 'fontSize',
                            min: 5,
                            max: 250,
                            value: 10,
                            step: 1,
                            randomiseable: true
                        }
                    ]
                },
                {
                    heading: 'Custom Characters',
                    class: 'flex-grid',
                    attributes: 'data-columns="1"',
                    items: [
                        {
                            type: 'textarea',
                            variable: 'customCharacters'
                        }
                    ]
                },
            ]
        };
        deck.matrix = window.hydra.renderer.init(deck, 'matrix', {defaults, ui});
        deck.matrix.shouldRender = true;

        deck.matrix.customCharactersInput.oninput = () => {
            deck.matrix.calculatedProperties = false;
        }

        deck.matrix.render = () => {
            if (!deck.matrix.calculatedProperties || (deck.matrix.calculatedAt && (deck.matrix.calculatedAt != deck.canvas.width))) {
                deck.matrix.calculateProperties();
            } else {
                if (deck.matrix.shouldRender) {
                    // gradually fades out previous rendered content
                    deck.ctx.fillStyle = `rgba(${deck.matrix.backgroundColor.r}, ${deck.matrix.backgroundColor.g}, ${deck.matrix.backgroundColor.b}, 0.05)`;
                    deck.ctx.fillRect(0, 0, deck.canvas.width, deck.canvas.height);

                    if (deck.matrix.characterColorMode == 'rainbow') {
                        const rainbowColorHexCode = deck.matrix.rainbowColors.hexCodes[deck.matrix.rainbowColors.current];
                        deck.matrix.rainbowColors.current = deck.matrix.rainbowColors.current == 6 ? 0 : deck.matrix.rainbowColors.current + 1;
                        deck.ctx.fillStyle = rainbowColorHexCode;
                    } else {

                        let r = deck.matrix.characterColorMode == 'cycle' ? ((Math.sin(Date.now() / deck.matrix.cycleSpeedR) + 1) / 2) * 255 : deck.matrix.characterColor.r;
                        let g = deck.matrix.characterColorMode == 'cycle' ? ((Math.sin(Date.now() / deck.matrix.cycleSpeedG) + 1) / 2) * 255 : deck.matrix.characterColor.g;
                        let b = deck.matrix.characterColorMode == 'cycle' ? ((Math.sin(Date.now() / deck.matrix.cycleSpeedB) + 1) / 2) * 255 : deck.matrix.characterColor.b;

                        deck.ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
                    }
                    deck.ctx.font = deck.matrix.fontSize + 'px monospace';

                    for(let i = 0; i < deck.matrix.rainDrops.length; i++)
                    {
                        const text = deck.matrix.alphabet.charAt(Math.floor(Math.random() * deck.matrix.alphabet.length));
                        deck.ctx.fillText(text, i * deck.matrix.fontSize, deck.matrix.rainDrops[i] * deck.matrix.fontSize);

                        if(deck.matrix.rainDrops[i] * deck.matrix.fontSize > deck.canvas.height && Math.random() > 0.985){
                            deck.matrix.rainDrops[i] = 0;
                        }
                        deck.matrix.rainDrops[i]++;
                    }
                    deck.matrix.shouldRender = false;
                } else {
                    deck.matrix.shouldRender = true;
                }
            }
        }

        return deck;
    }
};