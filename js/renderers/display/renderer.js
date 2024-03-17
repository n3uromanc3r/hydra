window.hydra.renderers['display'] = {
    init: function(deck) {
        const defaults = {
            asking: false,
            connected: false
        };
        const ui = {};
        deck.display = window.hydra.renderer.init(deck, 'display', {defaults, ui});

        const constraints = {
            'video': true,
            'audio': false
        }

        let displayShutoffInterval;
        let displayStream;

        deck.display.render = () => {
            if (!deck.display.connected) {
                if (!deck.display.asking) {
                    deck.display.asking = true;

                    try {
                        navigator.mediaDevices.getDisplayMedia(constraints)
                            .then(stream => {
                                deck.streamEl.srcObject = stream;
                                displayStream = stream;
                                deck.display.connected = true;
                                deck.display.asking = false;
                            });
                    } catch (err) {

                    }
                }
            }

            clearTimeout(displayShutoffInterval);

            const ratio = deck.canvas.width / deck.streamEl.videoWidth;
            deck.ctx.drawImage(deck.streamEl, 0, 0, deck.streamEl.videoWidth * ratio, deck.streamEl.videoHeight * ratio);

            if (deck.display.connected) {
                displayShutoffInterval = setTimeout(() => {
                    deck.display.connected = false;
                    deck.streamEl.pause();
                    deck.streamEl.src = "";
                    displayStream.getTracks().forEach(track => track.stop());
                }, 200);
            }

        }

        return deck;
    }
};