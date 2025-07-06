window.hydra.renderers['video'] = {
    init: function(deck) {
        const defaults = {
            hasPlayed: false,
            invertState: false,
            flipState: false,
            flipInvertState: false
        };
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
                    heading: 'Effects',
                    class: 'flex-grid',
                    attributes: 'data-columns="4"',
                    items: [
                        {
                            type: 'button',
                            variable: 'reverse',
                            text: 'Reverse',
                            class: '',
                            options: ['Reverse'],
                        },
                        {
                            type: 'button',
                            variable: 'holdReverse',
                            text: 'Hold Reverse',
                            class: '',
                            options: ['Hold Reverse'],
                        },
                        {
                            type: 'button',
                            variable: 'invert',
                            text: 'Invert',
                            class: '',
                            options: ['Invert'],
                        },
                        {
                            type: 'button',
                            variable: 'holdInvert',
                            text: 'Hold Invert',
                            class: '',
                            options: ['Hold Invert'],
                        },
                    ]
                },
                {
                    class: 'flex-grid',
                    attributes: 'data-columns="4"',
                    items: [
                        {
                            type: 'button',
                            variable: 'flip',
                            text: 'Flip',
                            class: '',
                            options: ['Flip'],
                        },
                        {
                            type: 'button',
                            variable: 'holdFlip',
                            text: 'Hold Flip',
                            class: '',
                            options: ['Hold Flip'],
                        },
                        {
                            type: 'button',
                            variable: 'flipInvert',
                            text: 'Flip Invert',
                            class: '',
                            options: ['Flip Invert'],
                        },
                        {
                            type: 'button',
                            variable: 'holdFlipInvert',
                            text: 'Hold Flip Invert',
                            class: '',
                            options: ['Hold Flip Invert'],
                        }
                    ]
                },
                ...[1,2,3,4,5,6,7,8,9,10].map(n => ({
                    heading: `Video ${n}`,
                    class: 'flex-grid',
                    attributes: 'data-columns="2"',
                    items: [
                        {
                            type: 'file',
                            label: 'File',
                            variable: `file${n}`
                        },
                        {
                            type: 'button',
                            label: 'Play',
                            variable: `play${n}`,
                            options: ['Play'],
                            text: 'Play',
                            class: 'red',
                            disabled: true
                        }
                    ]
                }))
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
            deck.video.file8Input,
            deck.video.file9Input,
            deck.video.file10Input,
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
                            playBtn.className = 'green';
                            deck.videoEl.src = url;
                            deck.videoEl.play();
                            deck.videoEl.playbackRate = deck.video.playbackRate;
                            stopReversePlayback();
                            deck.video.hasPlayed = true;
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

        // --- Reverse playback ---
        let reverseInterval = null;
        function startReversePlayback() {
            stopReversePlayback();
            deck.videoEl.pause();
            reverseInterval = setInterval(() => {
                if (deck.videoEl.currentTime > 0.033) {
                    deck.videoEl.currentTime -= 0.033;
                } else {
                    deck.videoEl.currentTime = deck.videoEl.duration;
                }
            }, 33);
            deck.video.reverseInput.className = 'green';
        }

        function stopReversePlayback() {
            if (reverseInterval) {
                clearInterval(reverseInterval);
                reverseInterval = null;
                deck.video.reverseInput.className = '';
            }
        }

        deck.video.reverseInput.addEventListener('click', () => {
            if (!deck.video.hasPlayed) return;

            if (reverseInterval) {
                stopReversePlayback();
                deck.videoEl.play();
                deck.videoEl.playbackRate = deck.video.playbackRate;
            } else {
                startReversePlayback();
            }
        });

        // --- Hold Reverse ---
        const holdBtn = deck.video.holdReverseInput;
        let holdReverseActive = false;
        let wasReversing = false;

        function startHoldReverse() {
            holdBtn.className = 'green';
            holdReverseActive = true;

            if (!deck.video.hasPlayed) return;

            if (reverseInterval) {
                wasReversing = true;
                stopReversePlayback();
                deck.videoEl.play();
                deck.videoEl.playbackRate = deck.video.playbackRate;
            } else {
                wasReversing = false;
                deck.videoEl.pause();
                startReversePlayback();
            }
        }

        function stopHoldReverse() {
            holdBtn.className = '';
            holdReverseActive = false;

            if (!deck.video.hasPlayed) return;

            if (wasReversing) {
                deck.videoEl.pause();
                startReversePlayback();
            } else {
                stopReversePlayback();
                deck.videoEl.play();
                deck.videoEl.playbackRate = deck.video.playbackRate;
            }
        }

        holdBtn.addEventListener('mousedown', startHoldReverse);
        holdBtn.addEventListener('touchstart', startHoldReverse);
        holdBtn.addEventListener('mouseup', stopHoldReverse);
        holdBtn.addEventListener('touchend', stopHoldReverse);

        // --- Invert ---
        const invertBtn = deck.video.invertInput;
        invertBtn.addEventListener('click', () => {
            deck.video.invertState = !deck.video.invertState;
            invertBtn.className = deck.video.invertState ? 'green' : '';
        });

        const holdInvertBtn = deck.video.holdInvertInput;
        let holdingInvert = false;
        let wasInverted = false;

        function startHoldInvert() {
            holdInvertBtn.className = 'green';
            holdingInvert = true;
            if (deck.video.invertState) {
                wasInverted = true;
                invertBtn.className = '';
            } else {
                wasInverted = false;
                invertBtn.className = 'green';
            }
        }

        function stopHoldInvert() {
            holdInvertBtn.className = '';
            holdingInvert = false;
            invertBtn.className = wasInverted ? 'green' : '';
        }

        holdInvertBtn.addEventListener('mousedown', startHoldInvert);
        holdInvertBtn.addEventListener('touchstart', startHoldInvert);
        holdInvertBtn.addEventListener('mouseup', stopHoldInvert);
        holdInvertBtn.addEventListener('touchend', stopHoldInvert);

        // --- Flip Horizontal ---
        const flipBtn = deck.video.flipInput;
        flipBtn.addEventListener('click', () => {
            deck.video.flipState = !deck.video.flipState;
            flipBtn.className = deck.video.flipState ? 'green' : '';
        });

        const holdFlipBtn = deck.video.holdFlipInput;
        let holdingFlip = false;
        let wasFlipped = false;

        function startHoldFlip() {
            holdFlipBtn.className = 'green';
            holdingFlip = true;
            if (deck.video.flipState) {
                wasFlipped = true;
                flipBtn.className = '';
            } else {
                wasFlipped = false;
                flipBtn.className = 'green';
            }
        }

        function stopHoldFlip() {
            holdFlipBtn.className = '';
            holdingFlip = false;
            deck.video.flipInput.className = wasFlipped ? 'green' : '';
        }

        holdFlipBtn.addEventListener('mousedown', startHoldFlip);
        holdFlipBtn.addEventListener('touchstart', startHoldFlip);
        holdFlipBtn.addEventListener('mouseup', stopHoldFlip);
        holdFlipBtn.addEventListener('touchend', stopHoldFlip);


        // --- Flip Invert Horizontal ---
        const flipInvertBtn = deck.video.flipInvertInput;
        flipInvertBtn.addEventListener('click', () => {
            deck.video.flipInvertState = !deck.video.flipInvertState;
            flipInvertBtn.className = deck.video.flipInvertState ? 'green' : '';
        });

        const holdFlipInvertBtn = deck.video.holdFlipInvertInput;
        let holdingFlipInvert = false;
        let wasFlippedInvert = false;

        function startHoldFlipInvert() {
            holdFlipInvertBtn.className = 'green';
            holdingFlipInvert = true;
            if (deck.video.flipInvertState) {
                wasFlippedInvert = true;
                flipInvertBtn.className = '';
            } else {
                wasFlippedInvert = false;
                flipInvertBtn.className = 'green';
            }
        }

        function stopHoldFlipInvert() {
            holdFlipInvertBtn.className = '';
            holdingFlipInvert = false;
            flipInvertBtn.className = wasFlippedInvert ? 'green' : '';
        }

        holdFlipInvertBtn.addEventListener('mousedown', startHoldFlipInvert);
        holdFlipInvertBtn.addEventListener('touchstart', startHoldFlipInvert);
        holdFlipInvertBtn.addEventListener('mouseup', stopHoldFlipInvert);
        holdFlipInvertBtn.addEventListener('touchend', stopHoldFlipInvert);

        // --- Main render ---
        deck.video.render = () => {
            if (deck.videoEl.src) {
                const ratio = deck.canvas.width / deck.videoEl.videoWidth;

                let effectiveFlip = (deck.video.flipState ^ holdingFlip) ^ (deck.video.flipInvertState ^ holdingFlipInvert);
                let effectiveInvert = (deck.video.flipInvertState ^ holdingFlipInvert) ^ (deck.video.invertState ^ holdingInvert);

                deck.ctx.save();

                if (effectiveFlip) {
                    deck.ctx.scale(-1, 1);
                    deck.ctx.drawImage(deck.videoEl, -deck.canvas.width, 0, deck.videoEl.videoWidth * ratio, deck.videoEl.videoHeight * ratio);
                } else {
                    deck.ctx.drawImage(deck.videoEl, 0, 0, deck.videoEl.videoWidth * ratio, deck.videoEl.videoHeight * ratio);
                }

                deck.ctx.restore();

                if (effectiveInvert) {
                    deck.ctx.globalCompositeOperation = 'difference';
                    deck.ctx.fillStyle = 'white';
                    deck.ctx.fillRect(0, 0, deck.canvas.width, deck.canvas.height);
                    deck.ctx.globalCompositeOperation = 'source-over';
                }
            }
        };

        return deck;
    }
};