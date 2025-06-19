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
        const ui = {};
        deck.camera = window.hydra.renderer.init(deck, 'camera', {defaults, ui});

        const constraints = {
            'video': true,
            'audio': false
        }

        let cameraShutoffInterval;
        let cameraStream;

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
                scale = deck.reactivity.adjust('scale', scale);
            }

            const ratio = deck.canvas.width / deck.streamEl.videoWidth;
            deck.ctx.drawImage(deck.streamEl, 0, 0, (deck.streamEl.videoWidth * ratio) * scale, (deck.streamEl.videoHeight * ratio) * scale);

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