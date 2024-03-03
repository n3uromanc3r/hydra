window.hydra.renderers['camera'] = {
    init: function(deck) {
        const defaults = {
            connected: false
        };
        const ui = {};
        deck.camera = window.hydra.renderer.init(deck, 'camera', defaults, ui);

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
                        deck.cameraEl.srcObject = stream;
                        cameraStream = stream;
                        deck.camera.connected = true;
                    });
            }

            clearInterval(cameraShutoffInterval);

            const ratio = deck.canvas.width / deck.cameraEl.videoWidth;
            deck.ctx.drawImage(deck.cameraEl, 0, 0, deck.cameraEl.videoWidth * ratio, deck.cameraEl.videoHeight * ratio);

            cameraShutoffInterval = setInterval(() => {
                deck.camera.connected = false;
                deck.cameraEl.pause();
                deck.cameraEl.src = "";
                cameraStream.getTracks().forEach(track => track.stop());
            }, 200);
        }

        return deck;
    }
};