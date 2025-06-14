window.hydra.renderers['camera'] = {
    init: function(deck) {
        const defaults = {
            connected: false,
            reactivity: {
                scale: {
                    enabled: true,
                    on: true,
                    cause: 'average',
                    effect: 'add',
                    strength: 10
                },
                color: {
                    enabled: false,
                    on: false,
                    cause: 'average',
                    effect: 'add',
                    strength: 10
                },
                alpha: {
                    enabled: false,
                    on: false,
                    cause: 'average',
                    effect: 'add',
                    strength: 10
                },
                amp: {
                    enabled: false,
                    on: false,
                    cause: 'average',
                    effect: 'add',
                    strength: 10
                }
            }
        };
        const ui = {
            fieldsets: [
                {
                    heading: 'Feedback',
                    class: 'flex',
                    attributes: 'data-columns="2"',
                    items: [
                        {
                            type: 'checkbox',
                            label: 'Feedback Enabled',
                            variable: 'feedbackEnabled',
                            checked: true,
                            randomiseable: true
                        },
                        {
                            type: 'range',
                            label: 'Feedback Level',
                            variable: 'feedbackLevel',
                            min: 0,
                            max: 1,
                            value: 0.005,
                            step: 0.001,
                            containerClass: 'grow',
                            randomiseable: true
                        },
                    ]
                }
            ]
        };
        deck.camera = window.hydra.renderer.init(deck, 'camera', {defaults, ui});

        const constraints = {
            'video': true,
            'audio': false
        }

        let cameraShutoffInterval;
        let cameraStream;

        deck.camera.image = new Image();

        let scale;

        deck.camera.render = () => {
            if (!deck.camera.connected) {
                navigator.mediaDevices.getUserMedia(constraints)
                    .then(stream => {
                        deck.streamEl.srcObject = stream;
                        cameraStream = stream;
                        deck.camera.connected = true;
                    });
            }

            clearTimeout(cameraShutoffInterval);

            scale = 1;

            if (deck.reactivity.on && deck.reactivity.scale.on) {
                scale = deck.reactivity.adjust('scale', scale / 50);
            }

            const ratio = deck.canvas.width / deck.streamEl.videoWidth;
            deck.ctx.drawImage(deck.streamEl, 0, 0, (deck.streamEl.videoWidth * ratio) * scale, (deck.streamEl.videoHeight * ratio) * scale);

            if (deck.camera.feedbackEnabled) {

                if (deck.camera.image !== undefined) {
                    deck.ctx.save();
                    deck.ctx.globalAlpha = deck.camera.feedbackLevel;
                    deck.ctx.drawImage(deck.camera.image, 0, 0);
                    deck.ctx.restore();
                }

                deck.camera.image.src = deck.canvas.toDataURL();
            }


            cameraShutoffInterval = setTimeout(() => {
                deck.camera.connected = false;
                deck.streamEl.pause();
                deck.streamEl.src = "";
                cameraStream.getTracks().forEach(track => track.stop());
            }, 200);
        }

        return deck;
    }
};