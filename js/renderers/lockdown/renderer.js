window.hydra.renderers['lockdown'] = {
    init: function(deck) {
        const defaults = {
            reactivity: {
                scale: {
                    enabled: true,
                    on: true,
                    cause: 'average',
                    effect: 'add',
                    strength: 100
                }
            },
            triangleSize: 10
        };
        const ui = {
            fieldsets: [
                {
                    heading: 'Translate Mode',
                    class: 'flex-grid',
                    attributes: 'data-columns="3"',
                    items: [
                        {
                            type: 'button',
                            label: 'X Axis',
                            variable: 'translateModeX',
                            text: 'center',
                            options: 'center,wave,mouse',
                            randomiseable: true
                        },
                        {
                            type: 'button',
                            label: 'Y Axis',
                            variable: 'translateModeY',
                            text: 'center',
                            options: 'center,wave,mouse',
                            randomiseable: true
                        }
                    ]
                },
                {
                    heading: 'Triangle',
                    class: 'flex-grid',
                    attributes: 'data-columns="3"',
                    items: [
                        {
                            type: 'range',
                            label: 'Count',
                            variable: 'triangleCount',
                            min: 1,
                            max: 100,
                            value: 40,
                            step: 1,
                            trigger: 'enableForceUpdate',
                            randomiseable: true
                        },
                        {
                            type: 'range',
                            label: 'Scale',
                            variable: 'triangleScale',
                            min: 0,
                            max: 6,
                            value: 1,
                            step: 0.001,
                            randomiseable: true
                        },
                        {
                            type: 'range',
                            label: 'Line Width',
                            variable: 'lineWidth',
                            min: 1,
                            max: 20,
                            value: 1,
                            step: 1,
                            disabled: true,
                            randomiseable: true
                        },
                        {
                            type: 'button',
                            label: 'Scale Mode',
                            variable: 'triangleScaleMode',
                            text: 'lin',
                            options: 'lin,log',
                            trigger: 'enableForceUpdate',
                            randomiseable: true
                        },
                        {
                            type: 'button',
                            label: 'Style',
                            variable: 'triangleStyle',
                            text: 'fill',
                            options: 'fill,stroke',
                            trigger: 'updateDisabledUIComponents',
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
                            type: 'button',
                            label: 'Type',
                            variable: 'rotationType',
                            text: 'alternate',
                            options: 'alternate,normal,reverse',
                            randomiseable: true
                        },
                        {
                            type: 'button',
                            label: 'From',
                            variable: 'rotationFrom',
                            text: 'inside-out',
                            options: 'inside-out,outside-in',
                            randomiseable: true
                        },
                        {
                            type: 'range',
                            label: 'Degree Multiplier',
                            variable: 'degreeMultiplier',
                            min: 0,
                            max: 5,
                            value: 0.5,
                            step: 0.00001,
                            randomiseable: true
                        },
                        {
                            type: 'range',
                            label: 'Max Rotation',
                            variable: 'maxRotation',
                            min: 0,
                            max: 360,
                            value: 120,
                            step: 1,
                            randomiseable: true
                        }
                    ]
                },
                {
                    heading: 'Frequencies',
                    class: 'flex-grid',
                    attributes: 'data-columns="3"',
                    items: [
                        {
                            type: 'button',
                            label: 'Frequency Control',
                            variable: 'frequencyControl',
                            text: 'single',
                            options: 'single,split',
                            trigger: 'updateDisabledUIComponents',
                            randomiseable: true
                        },
                        {
                            type: 'range',
                            label: 'Frequency',
                            variable: 'frequency',
                            min: 0.00001,
                            max: 0.00025,
                            value: 0.0001,
                            step: 0.00001,
                            class: 'frequencySingle',
                            randomiseable: true
                        },
                        {
                            type: 'empty'
                        },
                        {
                            type: 'range',
                            label: 'Frequency X/Y',
                            variable: 'frequencyMovement',
                            min: 0.00001,
                            max: 0.00045,
                            value: 0.0001,
                            step: 0.00001,
                            disabled: true,
                            class: 'frequencySplit',
                            randomiseable: true
                        },
                        {
                            type: 'range',
                            label: 'Frequency Rotation',
                            variable: 'frequencyRotation',
                            min: 0.00001,
                            max: 0.00025,
                            value: 0.0001,
                            step: 0.00001,
                            disabled: true,
                            class: 'frequencySplit',
                            randomiseable: true
                        },
                        {
                            type: 'range',
                            label: 'Frequency Color',
                            variable: 'frequencyColor',
                            min: 0.00001,
                            max: 0.00050,
                            value: 0.0001,
                            step: 0.00001,
                            disabled: true,
                            class: 'frequencySplit',
                            randomiseable: true
                        }
                    ]
                },
                {
                    heading: 'Color',
                    class: 'flex-grid',
                    attributes: 'data-columns="3"',
                    items: [
                        {
                            type: 'button',
                            label: 'Foreground Mode',
                            variable: 'colorMode',
                            text: 'normal',
                            options: 'normal,cycle',
                            randomiseable: true
                        },
                        {
                            type: 'button',
                            label: 'Background Mode',
                            variable: 'bgColorMode',
                            text: 'black',
                            options: 'black,match,opposite',
                            randomiseable: true
                        }
                    ]
                }
            ]
        };
        deck.lockdown = window.hydra.renderer.init(deck, 'lockdown', defaults, ui, './js/renderers/lockdown/presets.json');

        deck.lockdown.updateDisabledUIComponents = () => {
            if (deck.lockdown.frequencyControl == 'split') {
                deck.lockdown.frequencyInput.disabled = true;
                [
                    deck.lockdown.frequencyMovementInput,
                    deck.lockdown.frequencyRotationInput,
                    deck.lockdown.frequencyColorInput
                ].forEach(frequencySplitInput => {
                    frequencySplitInput.disabled = false;;
                });

                deck.lockdown.frequencyMovement = deck.lockdown.frequencyMovementInput.value;
                deck.lockdown.frequencyRotation = deck.lockdown.frequencyRotationInput.value;
                deck.lockdown.frequencyColor = deck.lockdown.frequencyColorInput.value;

            } else {
                deck.lockdown.frequencyInput.disabled = false;
                [
                    deck.lockdown.frequencyMovementInput,
                    deck.lockdown.frequencyRotationInput,
                    deck.lockdown.frequencyColorInput
                ].forEach(frequencySplitInput => {
                    frequencySplitInput.disabled = true;
                });
            }

            if (deck.lockdown.triangleStyle == 'fill') {
                deck.lockdown.lineWidthInput.disabled = true;
            } else {
                deck.lockdown.lineWidthInput.disabled = false;
            }
        };

        deck.lockdown.updateTriangles = () => {
            deck.lockdown.triangles = [];
            for (let i = 1; i <= deck.lockdown.triangleCount; i++) {
                deck.lockdown.triangleScaleMultiplier = deck.lockdown.triangleScaleMode == 'lin' ? 1 : (i/2);
                deck.lockdown.triangles.push({side: (deck.lockdown.triangleSize * i * deck.lockdown.triangleScaleMultiplier)});
            }

            deck.lockdown.triangles = deck.lockdown.triangles.reverse();

            deck.lockdown.forceUpdate = false;
        };

        deck.lockdown.enableForceUpdate = () => {
            deck.lockdown.forceUpdate = true;
        }

        deck.lockdown.render = () => {
            deck.ctx.translate(0, 0);
            deck.ctx.clearRect(0, 0, deck.canvas.width, deck.canvas.height);
            deck.ctx.fillStyle = deck.lockdown.bgColorMode == 'black' ? 'rgba(0,0,0,0)' : deck.lockdown.bgColor;
            deck.ctx.fillRect(0, 0, deck.canvas.width, deck.canvas.height);

            const totalTriangles = deck.lockdown.triangles.length;

            deck.lockdown.triangles.forEach(function(triangle, index) {

                if (deck.lockdown.frequencyControl == 'single') {
                    deck.lockdown.frequencyMovement = deck.lockdown.frequency;
                    deck.lockdown.frequencyRotation = deck.lockdown.frequency;
                    deck.lockdown.frequencyColor = deck.lockdown.frequency;
                }

                let triangleSide = triangle.side * deck.lockdown.triangleScale;

                if (deck.reactivity.on && deck.reactivity.scale.on) {
                    triangleSide = deck.reactivity.adjust('scale', triangleSide);
                }

                triangle.height = triangleSide * (Math.sqrt(3)/2);
                triangle.radius = triangleSide * (Math.sqrt(3)/3);

                deck.ctx.save();

                if (deck.lockdown.translateModeX == 'center') {
                    deck.lockdown.translateX = deck.canvas.width/2;
                } else if (deck.lockdown.translateModeX == 'wave') {
                    deck.lockdown.translateX = deck.canvas.width * (0.5*(1+Math.sin(2 * Math.PI * deck.lockdown.frequencyMovement * (Date.now() - (index * 100)))));
                } else if (deck.lockdown.translateModeX == 'mouse') {
                    if (!deck.mouse.lockedPosition) {
                        deck.lockdown.translateX = (deck.mouse.x - deck.canvas.closest('.column').getBoundingClientRect().x - 10) * deck.mouse.ratio;
                    }
                }

                if (deck.lockdown.translateModeY == 'center') {
                    deck.lockdown.translateY = deck.canvas.height/2;
                } else if (deck.lockdown.translateModeY == 'wave') {
                    deck.lockdown.translateY = deck.canvas.height * (0.5*(1+Math.sin(2 * Math.PI * (deck.lockdown.frequencyMovement / 2) * (Date.now() - (index * 100)))));
                } else if (deck.lockdown.translateModeY == 'mouse') {
                    if (!deck.mouse.lockedPosition) {
                        deck.lockdown.translateY = (deck.mouse.y - deck.canvas.closest('.column').getBoundingClientRect().y - 10) * deck.mouse.ratio;
                    }
                }

                deck.ctx.translate(deck.lockdown.translateX, deck.lockdown.translateY);

                let degree;

                if (deck.lockdown.rotationFrom == 'inside-out') {
                    degree = (deck.lockdown.degreeMultiplier * (1 + Math.sin(2 * Math.PI * deck.lockdown.frequencyRotation * (Date.now() + (index * 100))))) * deck.lockdown.maxRotation;
                } else if (deck.lockdown.rotationFrom == 'outside-in') {
                    degree = (deck.lockdown.degreeMultiplier * (1 + Math.sin(2 * Math.PI * deck.lockdown.frequencyRotation * (Date.now() - (index * 100))))) * deck.lockdown.maxRotation;
                }

                let rotationInRadians = degree * Math.PI / 180;

                if (deck.lockdown.rotationType == 'normal') {
                    deck.ctx.rotate(rotationInRadians);
                } else if (deck.lockdown.rotationType == 'reverse') {
                    deck.ctx.rotate(-rotationInRadians);
                } else if (deck.lockdown.rotationType == 'alternate') {
                    deck.ctx.rotate(index % 2 == 0 ? rotationInRadians : -rotationInRadians);
                }

                deck.ctx.beginPath();
                deck.ctx.moveTo(0, -triangle.radius);
                deck.ctx.lineTo(triangleSide/2, (triangle.height - triangle.radius));
                deck.ctx.lineTo(-triangleSide/2, (triangle.height - triangle.radius));
                deck.ctx.lineTo(0, -triangle.radius);
                deck.ctx.closePath();

                let r, g, b;

                if (deck.lockdown.colorMode == 'cycle') {

                    r = (0.5 * (1 + Math.sin(2 * Math.PI * (deck.lockdown.frequencyColor * 0.8) * (Date.now() - (index * 10))))) * 212;
                    g = (0.5 * (1 + Math.sin(2 * Math.PI * (deck.lockdown.frequencyColor * 1.2) * (Date.now() - (index * 10))))) * 241;
                    b = (0.5 * (1 + Math.sin(2 * Math.PI * (deck.lockdown.frequencyColor * 1) * (Date.now() - (index * 10))))) * 202;

                    r = r - (totalTriangles - index);
                    g = g - (totalTriangles - index);
                    b = b - (totalTriangles - index);

                } else {

                    r = (212 - (15*(totalTriangles - index)));
                    g = (241 - (7*(totalTriangles - index)));
                    b = (201 - (6*(totalTriangles - index)));

                }

                deck.ctx.shadowOffsetX = 2;
                deck.ctx.shadowOffsetY = 2;
                deck.ctx.shadowColor = 'rgba(0,0,0,0.2)';
                deck.ctx.shadowBlur = 5;

                if (deck.lockdown.triangleStyle == 'fill') {
                    deck.ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
                    deck.ctx.fill();
                } else {
                    deck.ctx.strokeStyle = `rgb(${r}, ${g}, ${b})`;
                    deck.ctx.lineWidth = deck.lockdown.lineWidth;
                    deck.ctx.stroke();
                }

                if (index == 1) {
                    if (deck.lockdown.bgColorMode == 'opposite') {
                        r = 255 - r;
                        g = 255 - g;
                        b = 255 - b;
                    }
                    deck.lockdown.bgColor = `rgb(${r}, ${g}, ${b})`;
                }

                deck.ctx.restore();

                if ((index+1) == totalTriangles) {
                    if (deck.lockdown.forceUpdate) {
                        deck.lockdown.updateTriangles();
                    }
                }
            });
        };

        deck.lockdown.updateTriangles(deck);

        return deck;
    }
};