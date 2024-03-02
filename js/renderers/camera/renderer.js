window.hydra.renderers['camera'] = {
    init: function(deck) {
        const defaults = {
            connected: false
        };
        const ui = {};
        deck.camera = window.hydra.renderer.init(deck, 'camera', defaults, ui);

        hydra.body.insertAdjacentHTML('beforeend', `<video id="camera-deck-${deck.id}" style="display:none;" playsinline autoplay></video>`);
        const video = document.getElementById(`camera-deck-${deck.id}`);

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
                        video.srcObject = stream;
                        cameraStream = stream;
                        deck.camera.connected = true;
                    });
            }

            clearInterval(cameraShutoffInterval);

            const ratio = deck.canvas.width / video.videoWidth;
            deck.ctx.drawImage(video, 0, 0, video.videoWidth * ratio, video.videoHeight * ratio);

            cameraShutoffInterval = setInterval(() => {
                deck.camera.connected = false;
                video.pause();
                video.src = "";
                cameraStream.getTracks().forEach(track => track.stop());
            }, 200);
        }

        return deck;
    }
};