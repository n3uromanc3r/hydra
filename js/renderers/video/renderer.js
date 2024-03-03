window.hydra.renderers['video'] = {
    init: function(deck) {
        const defaults = {
            video: null
        };
        const ui = {
            fieldsets: [
                {
                    heading: 'Settings',
                    class: 'flex-grid',
                    attributes: 'data-columns="1"',
                    items: [
                        {
                            type: 'file',
                            label: 'File',
                            variable: 'file'
                        }
                    ]
                }
            ]
        };
        deck.video = window.hydra.renderer.init(deck, 'video', defaults, ui);

        deck.video.fileInput.onchange = (e) => {
            if (deck.video.fileInput.files && deck.video.fileInput.files[0]) {
                const file = deck.video.fileInput.files[0];
                const url = URL.createObjectURL(file);
                const reader = new FileReader();

                reader.onload = function() {
                    deck.videoEl.src = url;
                    deck.videoEl.play();
                }
                reader.readAsDataURL(file);
            }
        }

        deck.video.render = () => {
            if (deck.videoEl.src) {
                const ratio = deck.canvas.width / deck.videoEl.videoWidth;
                deck.ctx.drawImage(deck.videoEl, 0, 0, deck.videoEl.videoWidth * ratio, deck.videoEl.videoHeight * ratio);
            }
        }

        return deck;
    }
};