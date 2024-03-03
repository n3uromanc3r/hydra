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

        const fileInput = document.getElementById(`video-file-deck-${deck.id}`);
        fileInput.onchange = (e) => {
            if (fileInput.files && fileInput.files[0]) {
                const file = fileInput.files[0];
                const url = URL.createObjectURL(file);
                const reader = new FileReader();

                const addedVideo = document.getElementById(`video-video-${deck.id}`);
                if (addedVideo) {
                    addedVideo.remove();
                }

                hydra.body.insertAdjacentHTML('beforeend', `<video id="video-video-${deck.id}" style="display:none;" hidden playsinline muted autoplay loop></video>`);
                deck.video.video = document.getElementById(`video-video-${deck.id}`);

                reader.onload = function() {
                    deck.video.video.src = url;
                    deck.video.video.play();
                }
                reader.readAsDataURL(file);
            }
        }

        deck.video.render = () => {
            if (deck.video.video) {
                const ratio = deck.canvas.width / deck.video.video.videoWidth;
                deck.ctx.drawImage(deck.video.video, 0, 0, deck.video.video.videoWidth * ratio, deck.video.video.videoHeight * ratio);
            }
        }

        return deck;
    }
};