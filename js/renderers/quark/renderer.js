window.hydra.renderers['quark'] = {
    init: function(deck) {
        const defaults = {
            reactivity: {
                scale: {
                    enabled: true,
                    on: true,
                    cause: 'average',
                    effect: 'add',
                    strength: 10
                }
            },
            triangleSize: 10
        };
        const ui = {
            fieldsets: [
                {
                    heading: 'Enabled',
                    items: [
                        {
                            type: 'checkbox',
                            label: 'Outer Circle',
                            variable: 'outerCircleEnabled',
                            checked: true,
                            randomiseable: true
                        },
                        {
                            type: 'checkbox',
                            label: 'Middle Circle',
                            variable: 'middleCircleEnabled',
                            checked: true,
                            randomiseable: true
                        },
                        {
                            type: 'checkbox',
                            label: 'Inner Circle',
                            variable: 'innerCircleEnabled',
                            checked: true,
                            randomiseable: true
                        },
                        {
                            type: 'checkbox',
                            label: '4-Point Circles',
                            variable: 'fourPointCirclesEnabled',
                            checked: false,
                            randomiseable: true
                        },
                        {
                            type: 'checkbox',
                            label: 'Large Triangle',
                            variable: 'largeTriangleEnabled',
                            checked: true,
                            randomiseable: true
                        },
                        {
                            type: 'checkbox',
                            label: 'Small Triangle',
                            variable: 'smallTriangleEnabled',
                            checked: true,
                            randomiseable: true
                        }
                    ]
                },
                {
                    heading: 'Color',
                    items: [
                        {
                            type: 'color',
                            label: 'Outer Circle',
                            variable: 'outerCircleColor',
                            value: '#ff0000',
                            randomiseable: true
                        },
                        {
                            type: 'color',
                            label: 'Middle Circle',
                            variable: 'middleCircleColor',
                            value: '#ff0000',
                            randomiseable: true
                        },
                        {
                            type: 'color',
                            label: 'Inner Circle',
                            variable: 'innerCircleColor',
                            value: '#000000',
                            randomiseable: true
                        },
                        {
                            type: 'color',
                            label: '4-Point Circles',
                            variable: 'fourPointCirclesColor',
                            value: '#ff0000',
                            randomiseable: true
                        },
                        {
                            type: 'color',
                            label: 'Large Triangle',
                            variable: 'largeTriangleColor',
                            value: '#ff0000',
                            randomiseable: true
                        },
                        {
                            type: 'color',
                            label: 'Small Triangle',
                            variable: 'smallTriangleColor',
                            value: '#ff0000',
                            randomiseable: true
                        }
                    ]
                },
                {
                    heading: 'Alpha',
                    class: 'flex-grid',
                    attributes: 'data-columns="3"',
                    items: [
                        {
                            type: 'range',
                            label: 'Outer Circle',
                            variable: 'outerCircleAlpha',
                            min: 0,
                            max: 1,
                            value: 1,
                            step: 0.01,
                            randomiseable: true
                        },
                        {
                            type: 'range',
                            label: 'Middle Circle',
                            variable: 'middleCircleAlpha',
                            min: 0,
                            max: 1,
                            value: 1,
                            step: 0.01,
                            randomiseable: true
                        },
                        {
                            type: 'range',
                            label: 'Inner Circle',
                            variable: 'innerCircleAlpha',
                            min: 0,
                            max: 1,
                            value: 1,
                            step: 0.01,
                            randomiseable: true
                        },
                        {
                            type: 'range',
                            label: '4-Point Circles',
                            variable: 'fourPointCirclesAlpha',
                            min: 0,
                            max: 1,
                            value: 1,
                            step: 0.01,
                            randomiseable: true
                        },
                        {
                            type: 'range',
                            label: 'Large Triangle',
                            variable: 'largeTriangleAlpha',
                            min: 0,
                            max: 1,
                            value: 1,
                            step: 0.01,
                            randomiseable: true
                        },
                        {
                            type: 'range',
                            label: 'Small Triangle',
                            variable: 'smallTriangleAlpha',
                            min: 0,
                            max: 1,
                            value: 1,
                            step: 0.01,
                            randomiseable: true
                        }
                    ]
                },
                {
                    class: 'flex no-wrap',
                    items: [
                        {
                            type: 'group',
                            heading: 'Cycle Color',
                            items: [
                                {
                                    type: 'checkbox',
                                    label: '4-Point Circles',
                                    variable: 'fourPointCirclesCycleColor',
                                    checked: true,
                                    randomiseable: true
                                },
                                {
                                    type: 'checkbox',
                                    label: 'Large Triangle',
                                    variable: 'largeTriangleCycleColor',
                                    checked: true,
                                    randomiseable: true
                                },
                                {
                                    type: 'checkbox',
                                    label: 'Small Triangle',
                                    variable: 'smallTriangleCycleColor',
                                    checked: true,
                                    randomiseable: true
                                }
                            ]
                        },
                        {
                            type: 'group',
                            heading: 'Cycle Interval',
                            items: [
                                {
                                    containerClass: 'w100',
                                    type: 'range',
                                    label: '4-Point Circles',
                                    variable: 'fourPointCirclesCycleInterval',
                                    min: 0,
                                    max: 30,
                                    value: 1,
                                    step: 0.1,
                                    randomiseable: true
                                }
                            ]
                        }
                    ]
                },
                {
                    heading: 'Cycle Frequency',
                    class: 'flex-grid',
                    attributes: 'data-columns="3"',
                    items: [
                        {
                            type: 'range',
                            label: 'Red',
                            subLabel: 'Large Triangle',
                            variable: 'largeTriangleCycleFrequencyR',
                            min: 0,
                            max: 5000,
                            value: 1200,
                            step: 1,
                            randomiseable: true
                        },
                        {
                            type: 'range',
                            label: 'Green',
                            subLabel: 'Large Triangle',
                            variable: 'largeTriangleCycleFrequencyG',
                            min: 0,
                            max: 5000,
                            value: 1800,
                            step: 1,
                            randomiseable: true
                        },
                        {
                            type: 'range',
                            label: 'Blue',
                            subLabel: 'Large Triangle',
                            variable: 'largeTriangleCycleFrequencyB',
                            min: 0,
                            max: 5000,
                            value: 2400,
                            step: 1,
                            randomiseable: true
                        },
                        {
                            type: 'range',
                            label: 'Red',
                            subLabel: 'Small Triangle',
                            variable: 'smallTriangleCycleFrequencyR',
                            min: 0,
                            max: 5,
                            value: 1,
                            step: 0.1,
                            randomiseable: true
                        },
                        {
                            type: 'range',
                            label: 'Green',
                            subLabel: 'Small Triangle',
                            variable: 'smallTriangleCycleFrequencyG',
                            min: 0,
                            max: 5,
                            value: 1,
                            step: 0.1,
                            randomiseable: true
                        },
                        {
                            type: 'range',
                            label: 'Blue',
                            subLabel: 'Small Triangle',
                            variable: 'smallTriangleCycleFrequencyB',
                            min: 0,
                            max: 5,
                            value: 1,
                            step: 0.1,
                            randomiseable: true
                        }
                    ]
                },
                {
                    heading: 'Rotation',
                    class: 'flex-grid',
                    attributes: 'data-columns="3"',
                    items: [
                        {
                            type: 'range',
                            label: 'Degree',
                            subLabel: 'Large Triangle',
                            variable: 'largeTriangleDegree',
                            min: 0,
                            max: 1000,
                            value: 0,
                            step: 1,
                            randomiseable: true
                        },
                        {
                            type: 'range',
                            label: 'Degree Mod',
                            subLabel: 'Large Triangle',
                            variable: 'largeTriangleDegreeIncrement',
                            min: 0,
                            max: 1000,
                            value: 0,
                            step: 0.001,
                            randomiseable: true,
                            dispatchEvent: 'largeTriangleDegreeInput'
                        },
                        {
                            type: 'range',
                            label: 'Degree Limit',
                            subLabel: 'Large Triangle',
                            variable: 'largeTriangleDegreeRestart',
                            min: 0,
                            max: 1000,
                            value: 360,
                            step: 1,
                            randomiseable: true,
                            dispatchEvent: 'largeTriangleDegreeInput'
                        },
                        {
                            type: 'range',
                            label: 'Degree Wave Max',
                            subLabel: 'Large Triangle',
                            variable: 'largeTriangleDegreeWaveMax',
                            min: 0,
                            max: 1000,
                            value: 15,
                            step: 1,
                            randomiseable: true,
                            dispatchEvent: 'largeTriangleDegreeInput'
                        },
                        {
                            type: 'range',
                            label: 'Degree Wave Amplitude',
                            subLabel: 'Large Triangle',
                            variable: 'largeTriangleDegreeWaveAmplitude',
                            min: 0,
                            max: 1000,
                            value: 30,
                            step: 1,
                            randomiseable: true,
                            dispatchEvent: 'largeTriangleDegreeInput'
                        },
                        {
                            type: 'range',
                            label: 'Degree Frequency',
                            subLabel: 'Large Triangle',
                            variable: 'largeTriangleDegreeWaveFrequency',
                            min: 0,
                            max: 24000,
                            value: 12000,
                            step: 1,
                            randomiseable: true,
                            dispatchEvent: 'largeTriangleDegreeInput'
                        }
                    ]
                },
                {
                    class: 'flex-grid',
                    attributes: 'data-columns="3"',
                    items: [
                        {
                            type: 'range',
                            label: 'Degree',
                            subLabel: 'Small Triangle',
                            variable: 'smallTriangleDegree',
                            min: 0,
                            max: 1000,
                            value: 0,
                            step: 1,
                            randomiseable: true
                        },
                        {
                            type: 'range',
                            label: 'Degree Mod',
                            subLabel: 'Small Triangle',
                            variable: 'smallTriangleDegreeIncrement',
                            min: 0,
                            max: 1000,
                            value: 10,
                            step: 1,
                            randomiseable: true,
                            dispatchEvent: 'smallTriangleDegreeInput'
                        },
                        {
                            type: 'range',
                            label: 'Degree Limit',
                            subLabel: 'Small Triangle',
                            variable: 'smallTriangleDegreeRestart',
                            min: 0,
                            max: 1000,
                            value: 360,
                            step: 1,
                            randomiseable: true,
                            dispatchEvent: 'smallTriangleDegreeInput'
                        },
                        {
                            type: 'range',
                            label: 'Degree Wave Max',
                            subLabel: 'Small Triangle',
                            variable: 'smallTriangleDegreeWaveMax',
                            min: 0,
                            max: 1000,
                            value: 15,
                            step: 1,
                            randomiseable: true,
                            dispatchEvent: 'smallTriangleDegreeInput'
                        },
                        {
                            type: 'range',
                            label: 'Degree Wave Amplitude',
                            subLabel: 'Small Triangle',
                            variable: 'smallTriangleDegreeWaveAmplitude',
                            min: 0,
                            max: 1000,
                            value: 30,
                            step: 1,
                            randomiseable: true,
                            dispatchEvent: 'smallTriangleDegreeInput'
                        },
                        {
                            type: 'range',
                            label: 'Degree Frequency',
                            subLabel: 'Small Triangle',
                            variable: 'smallTriangleDegreeWaveFrequency',
                            min: 0,
                            max: 24000,
                            value: 12000,
                            step: 1,
                            randomiseable: true,
                            dispatchEvent: 'smallTriangleDegreeInput'
                        }
                    ]
                },
                {
                    heading: 'Sync',
                    items: [
                        {
                            type: 'checkbox',
                            label: 'Sync',
                            variable: 'smallTriangleSync',
                            checked: true,
                            randomiseable: true
                        }
                    ]
                },
                {
                    class: 'flex no-wrap',
                    items: [
                        {
                            type: 'group',
                            heading: 'Scale',
                            items: [
                                {
                                    type: 'range',
                                    containerClass: 'w100',
                                    variable: 'scale',
                                    min: 0,
                                    max: 30,
                                    value: 0.75,
                                    step: 0.05
                                }
                            ]
                        },
                        {
                            type: 'group',
                            heading: 'Radius',
                            items: [
                                {
                                    type: 'range',
                                    containerClass: 'w100',
                                    variable: 'radius',
                                    min: 0,
                                    max: 1000,
                                    value: 200,
                                    step: 1
                                }
                            ]
                        }
                    ]
                },
                {
                    class: 'flex',
                    heading: 'Offset',
                    items: [
                        {
                            type: 'range',
                            containerClass: 'w100',
                            label: '4-Point Circles',
                            variable: 'fourPointCirclesOffset',
                            min: -200,
                            max: 200,
                            value: 50,
                            step: 1,
                            dispatchEvent: 'smallTriangleDegreeInput'
                        }
                    ]
                }
            ]
        };
        deck.quark = window.hydra.renderer.init(deck, 'quark', defaults, ui, './js/renderers/quark/presets.json');

        deck.quark.radius = parseInt(deck.quark.radiusInput.value);

        deck.quark.render = () => {
            let radius = deck.quark.radius * deck.scale;
            if (deck.reactivity.on && deck.reactivity.scale.on) {
                radius = deck.reactivity.adjust('scale', radius);

            }
            let time = Date.now();

            deck.ctx.clearRect(0, 0, deck.canvas.width, deck.canvas.height);

            if (deck.quark.smallTriangleSync) {
                deck.quark.smallTriangleDegree = deck.quark.smallTriangleDegree/1000;
            }

            deck.quark.largeTriangleDegree += (deck.quark.largeTriangleDegreeIncrement + (deck.quark.largeTriangleDegreeWaveMax/2 + deck.quark.largeTriangleDegreeWaveAmplitude * Math.sin(time/deck.quark.largeTriangleDegreeWaveFrequency)));
            deck.quark.smallTriangleDegree += deck.quark.smallTriangleDegreeIncrement;

            if (deck.quark.largeTriangleDegree >= deck.quark.largeTriangleDegreeRestart) deck.quark.largeTriangleDegree = 0;
            if (deck.quark.smallTriangleDegree >= deck.quark.smallTriangleDegreeRestart) deck.quark.smallTriangleDegree = 0;

            deck.ctx.translate(hydra.centerX, hydra.centerY);
            deck.ctx.rotate((Math.PI / 180) * deck.quark.largeTriangleDegree);
            deck.ctx.translate(-hydra.centerX, -hydra.centerY);

            if (deck.quark.outerCircleEnabled) {
                deck.ctx.strokeStyle = `rgba(${deck.quark.outerCircleColor.r}, ${deck.quark.outerCircleColor.g}, ${deck.quark.outerCircleColor.b}, ${deck.quark.outerCircleAlpha})`;
                deck.ctx.lineWidth = 4;
                if (deck.reactivity.on && deck.reactivity.scale.on) {
                    deck.ctx.lineWidth = (4/50) * (window.hydra.audio.percentage * deck.reactivity.scale.strength);
                }
                deck.ctx.beginPath();
                deck.ctx.arc(hydra.centerX, hydra.centerY, radius + (radius * 0.57), 0, 2 * Math.PI);
                deck.ctx.stroke();
                deck.ctx.closePath();
            }

            if (deck.quark.middleCircleEnabled) {
                deck.ctx.strokeStyle = `rgba(${deck.quark.middleCircleColor.r}, ${deck.quark.middleCircleColor.g}, ${deck.quark.middleCircleColor.b}, ${deck.quark.middleCircleAlpha})`;
                deck.ctx.lineWidth = 4;
                deck.ctx.beginPath();
                deck.ctx.arc(hydra.centerX, hydra.centerY, radius, 0, 2 * Math.PI);
                deck.ctx.stroke();
                deck.ctx.closePath();
            }

            y = (Math.sqrt(3)/2)*radius;
            x = (radius * Math.sqrt(3))/2;

            let r = 255/2 + 255 * Math.sin(time/deck.quark.largeTriangleCycleFrequencyR);
            let g = 255/2 + 255 * Math.sin(time/deck.quark.largeTriangleCycleFrequencyG);
            let b = 255/2 + 255 * Math.sin(time/deck.quark.largeTriangleCycleFrequencyB);

            let color = `rgba(${r}, ${g}, ${b}, ${deck.quark.largeTriangleAlpha})`;

            if (deck.quark.largeTriangleEnabled) {
                deck.ctx.fillStyle = deck.quark.largeTriangleCycleColor
                    ? color
                    : `rgba(${deck.quark.largeTriangleColor.r}, ${deck.quark.largeTriangleColor.g}, ${deck.quark.largeTriangleColor.b}, ${deck.quark.largeTriangleAlpha})`;
                deck.ctx.beginPath();
                deck.ctx.moveTo(hydra.centerX, hydra.centerY-radius);
                deck.ctx.lineTo(hydra.centerX+x, hydra.centerY+(radius/2));
                deck.ctx.lineTo(hydra.centerX-x, hydra.centerY+(radius/2));
                deck.ctx.fill();
            }

            if (deck.quark.innerCircleEnabled) {
                deck.ctx.fillStyle = `rgba(${deck.quark.innerCircleColor.r}, ${deck.quark.innerCircleColor.g}, ${deck.quark.innerCircleColor.b}, ${deck.quark.innerCircleAlpha})`;
                deck.ctx.beginPath();
                deck.ctx.arc(hydra.centerX, hydra.centerY, (radius/2), 0, 2 * Math.PI);
                deck.ctx.fill();
                deck.ctx.closePath();
            }

            deck.ctx.translate(hydra.centerX, hydra.centerY);
            deck.ctx.rotate( (Math.PI / 180) * -deck.quark.largeTriangleDegree);
            deck.ctx.translate(-hydra.centerX, -hydra.centerY);

            deck.ctx.translate(hydra.centerX, hydra.centerY);
            deck.ctx.rotate( (Math.PI / 180) * deck.quark.smallTriangleDegree);
            deck.ctx.translate(-hydra.centerX, -hydra.centerY);

            if (deck.reactivity.on && deck.reactivity.scale.on) {
                radius = (radius/1000) * (window.hydra.audio.percentage * deck.reactivity.scale.strength * 2);
            }

            y = (Math.sqrt(3)/2)*(radius/2);
            x = ((radius/2) * Math.sqrt(3))/2;

            r = 255/2 + 255 * Math.sin(time/deck.quark.smallTriangleCycleFrequencyR);
            g = 255/2 + 255 * Math.sin(time/deck.quark.smallTriangleCycleFrequencyG);
            b = 255/2 + 255 * Math.sin(time/deck.quark.smallTriangleCycleFrequencyB);

            color = `rgba(${r}, ${g}, ${b}, ${deck.quark.smallTriangleAlpha})`;

            if (deck.quark.smallTriangleEnabled) {
                deck.ctx.fillStyle = deck.quark.smallTriangleCycleColor
                    ? color
                    : `rgba(${deck.quark.smallTriangleColor.r}, ${deck.quark.smallTriangleColor.g}, ${deck.quark.smallTriangleColor.b}, ${deck.quark.smallTriangleAlpha})`;
                deck.ctx.beginPath();
                deck.ctx.moveTo(hydra.centerX, hydra.centerY-(radius/2));
                deck.ctx.lineTo(hydra.centerX+x, hydra.centerY+((radius/2)/2));
                deck.ctx.lineTo(hydra.centerX-x, hydra.centerY+((radius/2)/2));

                deck.ctx.fill();
            }

            if (!deck.quark.smallTriangleSync) {
                deck.ctx.setTransform(1, 0, 0, 1, 0, 0);
            }

            if (deck.quark.fourPointCirclesEnabled) {
                let timeInSecs = parseInt(time/(deck.quark.fourPointCirclesCycleInterval*1000));

                let offset = deck.quark.fourPointCirclesOffset;

                if (deck.reactivity.on && deck.reactivity.scale.on) {
                    offset = (offset/100) * (window.hydra.audio.percentage * deck.reactivity.scale.strength * 3);
                }

                deck.ctx.strokeStyle = ((timeInSecs % 4 == 0) && deck.quark.fourPointCirclesCycleColor)
                    ? `rgba(${r}, ${g}, ${b}, ${deck.quark.fourPointCirclesAlpha})`
                    : `rgba(${deck.quark.fourPointCirclesColor.r}, ${deck.quark.fourPointCirclesColor.g}, ${deck.quark.fourPointCirclesColor.b}, ${deck.quark.fourPointCirclesAlpha})`;
                deck.ctx.lineWidth = 4;
                deck.ctx.beginPath();
                deck.ctx.arc(hydra.centerX, hydra.centerY - (radius + offset), radius/10, 0, 2 * Math.PI);
                deck.ctx.stroke();
                deck.ctx.closePath();

                deck.ctx.strokeStyle = (((timeInSecs-1) % 4 == 0) && deck.quark.fourPointCirclesCycleColor)
                    ? `rgba(${r}, ${g}, ${b}, ${deck.quark.fourPointCirclesAlpha})`
                    : `rgba(${deck.quark.fourPointCirclesColor.r}, ${deck.quark.fourPointCirclesColor.g}, ${deck.quark.fourPointCirclesColor.b}, ${deck.quark.fourPointCirclesAlpha})`;
                deck.ctx.lineWidth = 4;
                deck.ctx.beginPath();
                deck.ctx.arc(hydra.centerX + (radius + offset), hydra.centerY, radius/10, 0, 2 * Math.PI);
                deck.ctx.stroke();
                deck.ctx.closePath();

                deck.ctx.strokeStyle = (((timeInSecs-2) % 4 == 0) && deck.quark.fourPointCirclesCycleColor)
                    ? `rgba(${r}, ${g}, ${b}, ${deck.quark.fourPointCirclesAlpha})`
                    : `rgba(${deck.quark.fourPointCirclesColor.r}, ${deck.quark.fourPointCirclesColor.g}, ${deck.quark.fourPointCirclesColor.b}, ${deck.quark.fourPointCirclesAlpha})`;
                deck.ctx.lineWidth = 4;
                deck.ctx.beginPath();
                deck.ctx.arc(hydra.centerX, hydra.centerY + (radius + offset), radius/10, 0, 2 * Math.PI);
                deck.ctx.stroke();
                deck.ctx.closePath();

                deck.ctx.strokeStyle = (((timeInSecs-3) % 4 == 0) && deck.quark.fourPointCirclesCycleColor)
                    ? `rgba(${r}, ${g}, ${b}, ${deck.quark.fourPointCirclesAlpha})`
                    : `rgba(${deck.quark.fourPointCirclesColor.r}, ${deck.quark.fourPointCirclesColor.g}, ${deck.quark.fourPointCirclesColor.b}, ${deck.quark.fourPointCirclesAlpha})`;
                deck.ctx.lineWidth = 4;
                deck.ctx.beginPath();
                deck.ctx.arc(hydra.centerX - (radius + offset), hydra.centerY, radius/10, 0, 2 * Math.PI);
                deck.ctx.stroke();
                deck.ctx.closePath();
            }
        };

        return deck;
    }
};