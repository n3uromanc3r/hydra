window.hydra.renderers['video'] = {
    init: function(deck) {
        const defaults = {};
        const ui = {
            fieldsets: [
                {
                    heading: 'Playback',
                    class: 'flex-grid',
                    attributes: 'data-columns="1"',
                    items: [
                        {
                            type: 'range',
                            label: 'Rate',
                            variable: 'playbackRate',
                            min: 0.25,
                            max: 10,
                            value: 1,
                            step: 0.25,
                            randomiseable: true
                        }
                    ]
                },
                {
                    heading: 'Video 1',
                    class: 'flex-grid',
                    attributes: 'data-columns="2"',
                    items: [
                        {
                            type: 'file',
                            label: 'File',
                            variable: 'file1'
                        },
                        {
                            type: 'button',
                            label: 'Play',
                            variable: 'play1',
                            options: ['Play'],
                            text: 'Play',
                            class: 'red',
                            disabled: true
                        }
                    ]
                },
                {
                    heading: 'Video 2',
                    class: 'flex-grid',
                    attributes: 'data-columns="2"',
                    items: [
                        {
                            type: 'file',
                            label: 'File',
                            variable: 'file2'
                        },
                        {
                            type: 'button',
                            label: 'Play',
                            variable: 'play2',
                            options: ['Play'],
                            text: 'Play',
                            class: 'red',
                            disabled: true
                        }
                    ]
                },
                {
                    heading: 'Video 3',
                    class: 'flex-grid',
                    attributes: 'data-columns="2"',
                    items: [
                        {
                            type: 'file',
                            label: 'File',
                            variable: 'file3'
                        },
                        {
                            type: 'button',
                            label: 'Play',
                            variable: 'play3',
                            options: ['Play'],
                            text: 'Play',
                            class: 'red',
                            disabled: true
                        }
                    ]
                },
                {
                    heading: 'Video 4',
                    class: 'flex-grid',
                    attributes: 'data-columns="2"',
                    items: [
                        {
                            type: 'file',
                            label: 'File',
                            variable: 'file4'
                        },
                        {
                            type: 'button',
                            label: 'Play',
                            variable: 'play4',
                            options: ['Play'],
                            text: 'Play',
                            class: 'red',
                            disabled: true
                        }
                    ]
                },
                {
                    heading: 'Video 5',
                    class: 'flex-grid',
                    attributes: 'data-columns="2"',
                    items: [
                        {
                            type: 'file',
                            label: 'File',
                            variable: 'file5'
                        },
                        {
                            type: 'button',
                            label: 'Play',
                            variable: 'play5',
                            options: ['Play'],
                            text: 'Play',
                            class: 'red',
                            disabled: true
                        }
                    ]
                },
                {
                    heading: 'Video 6',
                    class: 'flex-grid',
                    attributes: 'data-columns="2"',
                    items: [
                        {
                            type: 'file',
                            label: 'File',
                            variable: 'file6'
                        },
                        {
                            type: 'button',
                            label: 'Play',
                            variable: 'play6',
                            options: ['Play'],
                            text: 'Play',
                            class: 'red',
                            disabled: true
                        }
                    ]
                },
                {
                    heading: 'Video 7',
                    class: 'flex-grid',
                    attributes: 'data-columns="2"',
                    items: [
                        {
                            type: 'file',
                            label: 'File',
                            variable: 'file7'
                        },
                        {
                            type: 'button',
                            label: 'Play',
                            variable: 'play7',
                            options: ['Play'],
                            text: 'Play',
                            class: 'red',
                            disabled: true
                        }
                    ]
                }
            ]
        };
        deck.video = window.hydra.renderer.init(deck, 'video', {defaults, ui});

        const fileInputs = [
            deck.video.file1Input,
            deck.video.file2Input,
            deck.video.file3Input,
            deck.video.file4Input,
            deck.video.file5Input,
            deck.video.file6Input,
            deck.video.file7Input,
        ];

        fileInputs.forEach(fileInput => {
            fileInput.onchange = (e) => {
                if (fileInput.files && fileInput.files[0]) {
                    const file = fileInput.files[0];
                    const url = URL.createObjectURL(file);
                    const reader = new FileReader();

                    reader.onload = function() {
                        const playBtn = fileInput.closest('group').querySelector('button');
                        playBtn.className = 'orange';
                        playBtn.disabled = false;
                        playBtn.addEventListener('click', function(e) {
                            const playBtns = fileInput.closest('[data-tab-panel="renderer"]').querySelectorAll('button');
                            playBtns.forEach(btn => {
                                if (!btn.disabled) {
                                    btn.className = 'orange';
                                }
                            });
                            playBtn.className = 'green';
                            deck.videoEl.src = url;
                            deck.videoEl.play();
                            deck.videoEl.playbackRate = deck.video.playbackRate;
                        });
                    }
                    reader.readAsDataURL(file);
                }
            }
        });

        deck.video.playbackRateInput.addEventListener('input', function(e) {
            deck.videoEl.playbackRate = this.value;
        });

        deck.video.playbackRateInput.closest('.inline-input').insertAdjacentHTML('afterend', `<div class="inline-input">
            <span class="input-label">Elapsed Time</span><span class="value" data-deck="${deck.id}" data-visual="video" data-time-current>-</span>
        </div>
        <div class="inline-input">
            <span class="input-label">Duration</span><span class="value" data-deck="${deck.id}" data-visual="video" data-time-duration>-</span>
        </div>`);

        const timeDisplayCurrent = document.querySelector(`[data-deck="${deck.id}"][data-visual="video"][data-time-current]`);
        const timeDisplayDuration = document.querySelector(`[data-deck="${deck.id}"][data-visual="video"][data-time-duration]`);

        deck.videoEl.addEventListener('timeupdate', () => {
            timeDisplayCurrent.textContent = deck.videoEl.currentTime.toFixed(2);
            timeDisplayDuration.textContent = deck.videoEl.duration.toFixed(2);
        }, true);

        deck.video.render = () => {
            if (deck.videoEl.src) {
                const ratio = deck.canvas.width / deck.videoEl.videoWidth;
                deck.ctx.drawImage(deck.videoEl, 0, 0, deck.videoEl.videoWidth * ratio, deck.videoEl.videoHeight * ratio);
            }
        }

        return deck;
    }
};