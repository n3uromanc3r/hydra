window.hydra.renderers['camera'] = {
    init: function(deck) {
        const defaults = {
            connected: false
        };
        const ui = {};
        deck.camera = window.hydra.renderer.init(deck, 'camera', {defaults, ui});

        const constraints = {
            'video': true,
            'audio': false
        }

        let cameraShutoffInterval;
        let cameraStream;

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

            const ratio = deck.canvas.width / deck.streamEl.videoWidth;
            deck.ctx.drawImage(deck.streamEl, 0, 0, deck.streamEl.videoWidth * ratio, deck.streamEl.videoHeight * ratio);

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