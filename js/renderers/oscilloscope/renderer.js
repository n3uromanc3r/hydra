window.hydra.renderers['oscilloscope'] = {
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
                            label: 'Wave Color',
                            variable: 'waveColor',
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
                            label: 'Wave Mode',
                            variable: 'waveMode',
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
                    heading: 'Wave',
                    class: 'flex-grid',
                    attributes: 'data-columns="1"',
                    items: [
                        {
                            type: 'range',
                            label: 'Line Width',
                            variable: 'lineWidth',
                            min: 1,
                            max: 100,
                            value: 4,
                            step: 1,
                            randomiseable: true
                        }
                    ]
                }
            ]
        };
        deck.oscilloscope = window.hydra.renderer.init(deck, 'oscilloscope', {defaults, ui});

        deck.oscilloscope.render = () => {

            let v;
            let x;
            let y;

            let waveR = deck.oscilloscope.waveMode == 'cycle' ? ((Math.sin(Date.now() / deck.oscilloscope.cycleSpeedR) + 1) / 2) * 255 : deck.oscilloscope.waveColor.r;
            let waveG = deck.oscilloscope.waveMode == 'cycle' ? ((Math.sin(Date.now() / deck.oscilloscope.cycleSpeedG) + 1) / 2) * 255 : deck.oscilloscope.waveColor.g;
            let waveB = deck.oscilloscope.waveMode == 'cycle' ? ((Math.sin(Date.now() / deck.oscilloscope.cycleSpeedB) + 1) / 2) * 255 : deck.oscilloscope.waveColor.b;

            deck.ctx.strokeStyle = `rgb(${waveR}, ${waveG}, ${waveB})`;
            deck.ctx.lineWidth = deck.oscilloscope.lineWidth;

            if (deck.oscilloscope.bgColorMode == 'selected') {
                deck.ctx.fillStyle = `rgb(${deck.oscilloscope.backgroundColor.r}, ${deck.oscilloscope.backgroundColor.g}, ${deck.oscilloscope.backgroundColor.b})`;
            } else if (deck.oscilloscope.bgColorMode == 'match') {
                deck.ctx.fillStyle = `rgba(${waveR}, ${waveG}, ${waveB}, 0.2)`;
            } else {
                let bgR = 255 - waveR;
                let bgG = 255 - waveG;
                let bgB = 255 - waveB;
                deck.ctx.fillStyle = `rgb(${bgR}, ${bgG}, ${bgB})`;
            }

            deck.ctx.fillRect(0, 0, deck.canvas.width, deck.canvas.height);

            if (hydra.audio.listening && deck.reactivity.on) {
                try {
                    deck.oscilloscope.uint8Array = _.cloneDeep(hydra.audio.uint8Array);
                    hydra.audio.analyser.getByteTimeDomainData(deck.oscilloscope.uint8Array);
                    const segmentWidth = deck.canvas.width / hydra.audio.analyser.frequencyBinCount;

                    deck.ctx.beginPath();
                    deck.ctx.moveTo(-100, deck.canvas.height / 2);

                    for (let i = 1; i < hydra.audio.analyser.frequencyBinCount; i += 1) {
                        x = i * segmentWidth;
                        v = deck.oscilloscope.uint8Array[i] / 128.0;
                        y = (v * deck.canvas.height) / 2;

                        deck.ctx.lineTo(x, y);
                    }
                } catch (err) {
                    // bad things happened
                }
            } else {
                deck.ctx.beginPath();
                deck.ctx.moveTo(0, deck.canvas.height / 2);
                deck.ctx.lineTo(deck.canvas.width, deck.canvas.height / 2);
                deck.ctx.stroke();
            }
            deck.ctx.lineTo(deck.canvas.width + 100, deck.canvas.height / 2);
            deck.ctx.stroke();
        }

        return deck;
    }
};