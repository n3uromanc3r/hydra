window.hydra.renderers['bars'] = {
    init: function(deck) {
        const defaults = {};
        const ui = {
            fieldsets: [
                {
                    heading: 'Color',
                    class: 'flex',
                    items: [
                        {
                            type: 'color',
                            label: 'Bar Color',
                            variable: 'barColor',
                            value: '#33ee55',
                            randomiseable: true
                        },
                        {
                            type: 'color',
                            label: 'Background Color',
                            variable: 'backgroundColor',
                            value: '#181818',
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
                            label: 'Bar Mode',
                            variable: 'barMode',
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
                    heading: 'Dimensions',
                    class: 'flex-grid',
                    attributes: 'data-columns="1"',
                    items: [
                        {
                            type: 'range',
                            label: 'Bar Width',
                            variable: 'barWidth',
                            min: 0.1,
                            max: 25,
                            value: 2.5,
                            step: 0.1,
                            randomiseable: true
                        },
                        {
                            type: 'range',
                            label: 'Bar Height',
                            variable: 'barHeight',
                            min: 0.1,
                            max: 5,
                            value: 1,
                            step: 0.1,
                            randomiseable: true
                        }
                    ]
                },
                {
                    heading: 'Direction',
                    class: 'flex-grid',
                    attributes: 'data-columns="3"',
                    items: [
                        {
                            type: 'button',
                            label: 'Direction',
                            variable: 'direction',
                            text: 'up',
                            options: 'up,down',
                            randomiseable: true
                        }
                    ]
                },
            ]
        };
        deck.bars = window.hydra.renderer.init(deck, 'bars', defaults, ui);

        deck.bars.render = () => {

            let barR = deck.bars.barMode == 'cycle' ? ((Math.sin(Date.now() / deck.bars.cycleSpeedR) + 1) / 2) * 255 : deck.bars.barColor.r;
            let barG = deck.bars.barMode == 'cycle' ? ((Math.sin(Date.now() / deck.bars.cycleSpeedG) + 1) / 2) * 255 : deck.bars.barColor.g;
            let barB = deck.bars.barMode == 'cycle' ? ((Math.sin(Date.now() / deck.bars.cycleSpeedB) + 1) / 2) * 255 : deck.bars.barColor.b;

            if (deck.bars.bgColorMode == 'selected') {
                deck.ctx.fillStyle = `rgb(${deck.bars.backgroundColor.r}, ${deck.bars.backgroundColor.g}, ${deck.bars.backgroundColor.b})`;
            } else if (deck.bars.bgColorMode == 'match') {
                deck.ctx.fillStyle = `rgba(${barR}, ${barG}, ${barB}, 0.2)`;
            } else {
                let bgR = 255 - barR;
                let bgG = 255 - barG;
                let bgB = 255 - barB;
                deck.ctx.fillStyle = `rgb(${bgR}, ${bgG}, ${bgB})`;
            }

            deck.ctx.fillRect(0, 0, deck.canvas.width, deck.canvas.height);

            if (hydra.audio.listening && deck.reactivity.on) {
                try {
                    const bufferLength = hydra.audio.analyser.frequencyBinCount;
                    const barWidth = (deck.canvas.width / bufferLength) * deck.bars.barWidth;
                    let barHeight;
                    let x = 0;
                    deck.bars.uint8Array = _.cloneDeep(hydra.audio.uint8Array);

                    for (let i = 0; i < bufferLength; i++) {
                        barHeight = deck.bars.uint8Array[i] * deck.bars.barHeight;

                        deck.ctx.fillStyle = `rgb(${barR}, ${barG}, ${barB})`;

                        if (deck.bars.direction == 'down') {
                            deck.ctx.fillRect(x, 0, barWidth, barHeight);
                        } else {
                            deck.ctx.fillRect(x, deck.canvas.height - barHeight, barWidth, barHeight);
                        }

                        x += barWidth + 1;
                    }
                } catch (err) {
                    // bad things happened
                }
            }
        }

        return deck;
    }
};