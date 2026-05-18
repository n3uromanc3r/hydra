// Mobile Hydra - Butterchurn + Video VJ Interface
class MobileHydra {
    constructor() {
        this.butterchurnRenderer = null;
        this.videoElement = null;
        this.currentVideo = null;
        this.crossfaderValue = 50;
        this.audioContext = null;
        this.audioSource = null;
        this.butterchurnActive = false;
        this.videoActive = false;
        this.autoMode = false;
        this.autoModeInterval = null;
        this.videoEffects = {
            invert: false,
            flip: false,
            reverse: false,
            speed: 1
        };
        
        // Preset management
        this.presets = {};
        this.presetKeys = [];
        this.currentPresetIndex = 0;
        
        // Favorites system
        this.favoritePresets = [];
        this.allPresets = {};
        this.showingFavorites = true;
        
        // Default favorite presets (popular ones)
        this.defaultFavorites = [
            'Flexi, martin + geiss - dedicated to the sherwin maxawow',
            'Rovastar - Fractopia',
            'Martin - castle in the air',
            'Geiss - Blur Scope',
            'Rovastar - Forgotten Abyss',
            'Martin - Dielectric Breakdown',
            'Flexi - mindblob beta',
            'Geiss + Flexi - Morphing Hypertunnel Mix',
            'Rovastar - Wormhole Pillars',
            'Martin - Spastic Turtle'
        ];
        
        // Video slots (6 slots)
        this.videoSlots = [null, null, null, null, null, null];
        
        // GIF support - one player per slot
        this.gifPlayers = [null, null, null, null, null, null];
        this.gifImageElements = [null, null, null, null, null, null];
        this.gifImageLoaded = false;
        
        // Blend mode
        this.blendMode = 'source-over';
        
        // Remote control
        this.ws = null;
        this.isConnectedToController = false;
        this.remoteControlEnabled = false;
        this.clientId = null;
        
        // Emergency state
        this.emergencyMode = false;
        this.lastKnownState = null;

        // Scene management
        this.scenes = {};
        this.currentScene = null;

        // Microphone sensitivity
        this.micSensitivity = 1.0; // Default to 1 (no change)
        this.micGainNode = null;
        
        // Projection mapping
        this.mappingController = null;
        
        this.init();
    }
    
    async init() {
        try {
            this.showLoadingOverlay();
            
            await this.setupCanvas();
            await this.setupAudio();
            await this.setupButterchurn();
            this.setupVideo();
            this.setupControls();
            this.setupGestures();
            this.setupMapping();
            
            this.hideLoadingOverlay();
            this.startRender();
            
            // Try to connect to remote control server
            this.connectToRemoteControl();
            
            // Show setup modal initially
            setTimeout(() => {
                this.showSetupModal();
            }, 500);
            
        } catch (error) {
            console.error('Initialization error:', error);
            this.hideLoadingOverlay();
            alert('Error initializing Hydra Mobile. Please refresh the page.');
        }
    }
    
    showLoadingOverlay() {
        document.getElementById('loading-overlay').style.display = 'flex';
    }
    
    hideLoadingOverlay() {
        const overlay = document.getElementById('loading-overlay');
        overlay.style.opacity = '0';
        setTimeout(() => {
            overlay.style.display = 'none';
        }, 500);
    }
    
    async setupCanvas() {
        // Main display canvas (2D for video and compositing)
        this.canvas = document.getElementById('mobile-output-canvas');
        this.ctx = this.canvas.getContext('2d', { 
            alpha: false,
            desynchronized: true,
            powerPreference: "high-performance"
        });
        
        // Hidden canvas for Butterchurn (WebGL)
        this.butterchurnCanvas = document.createElement('canvas');
        this.butterchurnCanvas.style.display = 'none';
        document.body.appendChild(this.butterchurnCanvas);
        
        const resizeCanvas = () => {
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            const rect = this.canvas.getBoundingClientRect();
            
            // Main canvas
            this.canvas.width = rect.width * dpr;
            this.canvas.height = rect.height * dpr;
            this.ctx.scale(dpr, dpr);
            this.canvas.style.width = rect.width + 'px';
            this.canvas.style.height = rect.height + 'px';
            
            // Butterchurn canvas (same size)
            this.butterchurnCanvas.width = this.canvas.width;
            this.butterchurnCanvas.height = this.canvas.height;
            
            // Update butterchurn renderer size if it exists
            if (this.butterchurnRenderer) {
                try {
                    this.butterchurnRenderer.setRendererSize(this.butterchurnCanvas.width, this.butterchurnCanvas.height);
                } catch (error) {
                    console.warn('Failed to resize butterchurn renderer:', error);
                }
            }
        };
        
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
        
        // Initial black screen
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    async setupAudio() {
        try {
            // Create audio context but don't start microphone yet
            // Don't specify sampleRate to let it match the system default
            // This prevents sample rate mismatch errors when connecting microphone
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)({
                latencyHint: 'interactive'
            });
            
            console.log('Audio context created with sample rate:', this.audioContext.sampleRate);
            
            // Create a silent audio source for butterchurn (some presets need audio data)
            this.createSilentAudioSource();
            
            console.log('Audio context created successfully');
            
        } catch (error) {
            console.warn('Audio context creation failed:', error);
            document.querySelector('.audio-status').textContent = '🔇 No Audio';
        }
    }
    
    createSilentAudioSource() {
        try {
            // Create a silent oscillator as fallback audio source
            this.silentOscillator = this.audioContext.createOscillator();
            this.silentGain = this.audioContext.createGain();
            
            this.silentGain.gain.value = 0.001; // Very quiet
            this.silentOscillator.frequency.value = 440; // A note
            
            this.silentOscillator.connect(this.silentGain);
            this.silentGain.connect(this.audioContext.destination);
            
            // Use silent source as default
            this.audioSource = this.silentGain;
            
            this.silentOscillator.start();
            console.log('Silent audio source created');
            
        } catch (error) {
            console.warn('Could not create silent audio source:', error);
        }
    }
    
    async setupButterchurn() {
        if (typeof butterchurn !== 'undefined' && this.audioContext && this.butterchurnCanvas) {
            try {
                // Create butterchurn visualizer on separate WebGL canvas
                this.butterchurnRenderer = butterchurn.createVisualizer(this.audioContext, this.butterchurnCanvas, {
                    width: this.butterchurnCanvas.width,
                    height: this.butterchurnCanvas.height,
                    pixelRatio: Math.min(window.devicePixelRatio || 1, 2)
                });
                
                // Connect audio source
                if (this.audioSource) {
                    this.butterchurnRenderer.connectAudio(this.audioSource);
                    console.log('Audio source connected to butterchurn');
                }
                
                this.loadButterchurnPresets();
                console.log('Butterchurn initialized successfully');
                
                // Enable butterchurn by default
                this.butterchurnActive = true;
                document.getElementById('butterchurn-enable').classList.add('active');
                document.getElementById('butterchurn-enable').textContent = 'ON';
                
            } catch (error) {
                console.error('Butterchurn initialization failed:', error);
                document.querySelector('.audio-status').textContent = '🔇 Error';
            }
        } else {
            console.warn('Butterchurn not available or missing dependencies');
        }
    }
    
    loadButterchurnPresets() {
        try {
            // Get presets from butterchurn libraries
            const basePresets = typeof butterchurnPresets !== 'undefined' ? butterchurnPresets.getPresets() : {};
            const extraPresets = typeof butterchurnPresetsExtra !== 'undefined' ? butterchurnPresetsExtra.getPresets() : {};
            
            this.allPresets = Object.assign({}, basePresets, extraPresets);

            console.log(`Loaded ${Object.keys(this.allPresets).length} total presets`);
            console.log('All presets content (before assigning to this.presets):', this.allPresets);

            // Ensure all presets are available for remote loading
            this.presets = this.allPresets;
            console.log('DEBUG: mobile-hydra.js - this.presets after assignment:', Object.keys(this.presets).length, 'presets');

            // Load favorites from localStorage or use defaults
            this.loadFavoritePresets();

            // Load saved scenes
            this.loadScenesFromStorage();

            // Initialize with favorites (for local navigation)
            this.updatePresetList();
            console.log('Preset keys after updatePresetList (local navigation):', this.presetKeys);

            // Load first favorite preset with delay to ensure butterchurn is ready
            setTimeout(() => {
                if (this.presetKeys.length > 0) {
                    this.loadPreset(this.presetKeys[0]);
                }
            }, 1000);
            
        } catch (error) {
            console.error('Failed to load presets:', error);
            document.getElementById('butterchurn-presets').innerHTML = '<option>No presets available</option>';
        }
    }
    
    loadFavoritePresets() {
        try {
            // Try to load from localStorage first
            const saved = localStorage.getItem('hydra-mobile-favorites');
            if (saved) {
                this.favoritePresets = JSON.parse(saved);
                console.log(`Loaded ${this.favoritePresets.length} saved favorites`);
            } else {
                // Use default favorites, filtering only existing presets
                this.favoritePresets = this.defaultFavorites.filter(preset => 
                    this.allPresets.hasOwnProperty(preset)
                );
                console.log(`Using ${this.favoritePresets.length} default favorites`);
                this.saveFavoritePresets();
            }
        } catch (error) {
            console.warn('Error loading favorites, using defaults:', error);
            this.favoritePresets = this.defaultFavorites.filter(preset => 
                this.allPresets.hasOwnProperty(preset)
            );
        }
    }
    
    saveFavoritePresets() {
        try {
            localStorage.setItem('hydra-mobile-favorites', JSON.stringify(this.favoritePresets));
        } catch (error) {
            console.warn('Could not save favorites to localStorage:', error);
        }
    }
    
    updatePresetList() {
        if (this.showingFavorites) {
            // Only update presetKeys for local navigation
            this.presetKeys = this.favoritePresets.filter(name => this.allPresets[name]);
        } else {
            this.presetKeys = Object.keys(this.allPresets).sort();
        }

        this.currentPresetIndex = 0;
        this.populatePresetSelector();
    }
    
    populatePresetSelector() {
        const selector = document.getElementById('butterchurn-presets');
        selector.innerHTML = '';
        
        // Add mode indicator
        const modeOption = document.createElement('option');
        modeOption.disabled = true;
        modeOption.textContent = this.showingFavorites ? 
            `❤️ Favorites (${this.presetKeys.length})` : 
            `📋 All Presets (${this.presetKeys.length})`;
        selector.appendChild(modeOption);
        
        this.presetKeys.forEach((key, index) => {
            const option = document.createElement('option');
            option.value = key;
            option.textContent = this.shortenPresetName(key);
            selector.appendChild(option);
        });
        
        console.log(`Updated preset list: ${this.showingFavorites ? 'Favorites' : 'All'} (${this.presetKeys.length} presets)`);
    }
    
    shortenPresetName(name) {
        // Shorten long preset names for mobile
        if (name.length > 25) {
            return name.substring(0, 22) + '...';
        }
        return name;
    }
    
    loadPreset(presetName, blendTime = 2.0) {
        const trimmedPresetName = presetName.trim();
        console.log('DEBUG: mobile-hydra.js - Attempting to load preset (trimmed):', trimmedPresetName);
        console.log('DEBUG: mobile-hydra.js - this.presets[trimmedPresetName]:', this.presets[trimmedPresetName]);
        console.log('DEBUG: mobile-hydra.js - All available preset keys:', Object.keys(this.presets));
        if (this.butterchurnRenderer && this.presets[trimmedPresetName]) {
            try {
                console.log('Loading preset:', trimmedPresetName);
                this.butterchurnRenderer.loadPreset(this.presets[presetName], blendTime);
                document.getElementById('butterchurn-presets').value = presetName;
                document.getElementById('current-preset').textContent = this.shortenPresetName(presetName);
                
                // Update favorite button
                this.updateFavoriteButton();
                
                // Add visual feedback
                this.canvas.classList.add('preset-changing');
                setTimeout(() => {
                    this.canvas.classList.remove('preset-changing');
                }, 500);
                
                console.log('Successfully loaded preset:', presetName);
                
            } catch (error) {
                console.error('Failed to load preset:', presetName, error);
            }
        } else {
            console.warn('Cannot load preset:', {
                presetName,
                hasRenderer: !!this.butterchurnRenderer,
                hasPreset: !!this.presets[presetName]
            });
        }
    }
    
    setupVideo() {
        this.videoElement = document.createElement('video');
        this.videoElement.crossOrigin = 'anonymous';
        this.videoElement.loop = true;
        this.videoElement.muted = true;
        this.videoElement.playsInline = true;
        this.videoElement.preload = 'metadata';
        
        // Video event listeners
        this.videoElement.addEventListener('loadeddata', () => {
            console.log('Video loaded successfully');
        });
        
        this.videoElement.addEventListener('error', (e) => {
            console.error('Video error:', e);
            this.updateVideoStatus('❌ Error');
        });
        
        this.videoElement.addEventListener('play', () => {
            this.updateVideoStatus('▶ Playing');
        });
        
        this.videoElement.addEventListener('pause', () => {
            this.updateVideoStatus('⏸ Paused');
        });
    }
    
    updateVideoStatus(status) {
        document.querySelector('.video-status').textContent = status;
    }
    
    setupControls() {
        // Controls toggle
        document.getElementById('expand-controls').addEventListener('click', () => {
            this.toggleControls();
        });
        
        // Butterchurn controls
        document.getElementById('prev-preset').addEventListener('click', () => {
            this.previousPreset();
        });
        
        document.getElementById('next-preset').addEventListener('click', () => {
            this.nextPreset();
        });
        
        document.getElementById('random-preset').addEventListener('click', () => {
            this.randomPreset();
        });
        
        document.getElementById('auto-mode').addEventListener('click', () => {
            this.toggleAutoMode();
        });
        
        document.getElementById('favorite-preset').addEventListener('click', () => {
            this.toggleFavorite();
        });
        
        document.getElementById('preset-mode').addEventListener('click', () => {
            this.togglePresetMode();
        });
        
        document.getElementById('manage-presets').addEventListener('click', () => {
            this.showPresetManager();
        });
        
        document.getElementById('butterchurn-enable').addEventListener('click', () => {
            this.toggleButterchurn();
        });
        
        document.getElementById('butterchurn-presets').addEventListener('change', (e) => {
            const presetName = e.target.value;
            this.currentPresetIndex = this.presetKeys.indexOf(presetName);
            this.loadPreset(presetName);
        });
        
        // Crossfader
        document.getElementById('main-crossfader').addEventListener('input', (e) => {
            this.crossfaderValue = parseInt(e.target.value);
            this.updateMixRatio();
        });
        
        // Video controls
        document.getElementById('upload-video').addEventListener('click', () => {
            document.getElementById('video-upload').click();
        });
        
        document.getElementById('video-upload').addEventListener('change', (e) => {
            this.handleVideoUpload(e);
        });
        
        document.getElementById('video-effects').addEventListener('click', () => {
            this.showEffectsPanel();
        });
        
        document.getElementById('video-speed').addEventListener('input', (e) => {
            this.videoEffects.speed = parseFloat(e.target.value);
            if (this.videoElement && !this.videoEffects.reverse) {
                this.videoElement.playbackRate = this.videoEffects.speed;
            }
        });
        
        document.getElementById('video-enable').addEventListener('click', () => {
            this.toggleVideo();
        });
        
        // Video slots
        const videoSlots = document.querySelectorAll('.video-slot');
        console.log('🎯 Setting up video slot listeners, found', videoSlots.length, 'slots');
        videoSlots.forEach((slot, index) => {
            console.log('  📌 Slot', index, 'data-slot:', slot.dataset.slot);
            slot.addEventListener('click', () => {
                console.log('🖱️ Slot clicked:', index);
                this.selectVideoSlot(index);
            });
        });
        
        // Effects panel
        document.getElementById('close-effects').addEventListener('click', () => {
            this.hideEffectsPanel();
        });
        
        document.querySelectorAll('.effect-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.toggleVideoEffect(btn.dataset.effect);
            });
        });
        
        // Setup modal
        document.getElementById('close-setup').addEventListener('click', () => {
            this.hideSetupModal();
        });
        
        document.getElementById('enable-mic').addEventListener('click', () => {
            this.requestMicrophone();
        });
        
        document.getElementById('load-url').addEventListener('click', () => {
            this.loadVideoFromURL();
        });
        
        // URL loader in effects panel
        document.getElementById('effects-panel-load-url').addEventListener('click', () => {
            this.loadVideoFromURLEffectsPanel();
        });
        
        document.getElementById('quick-upload').addEventListener('change', (e) => {
            this.handleVideoUpload(e);
            this.hideSetupModal();
        });
        
        // Debug button
        document.getElementById('debug-info').addEventListener('click', () => {
            this.showDebugInfo();
        });
        
        // Preset manager controls
        document.getElementById('close-preset-manager').addEventListener('click', () => {
            this.hidePresetManager();
        });
        
        document.getElementById('reset-favorites').addEventListener('click', () => {
            if (confirm('Reset favorites to defaults? This will remove all your custom favorites.')) {
                this.favoritePresets = this.defaultFavorites.filter(preset => 
                    this.allPresets.hasOwnProperty(preset)
                );
                this.saveFavoritePresets();
                this.updatePresetList();
                this.populatePresetManager();
            }
        });
    }
    
    setupGestures() {
        let touchStartY = 0;
        let touchStartTime = 0;
        let lastTap = 0;
        
        // Double tap to toggle overlay info
        this.canvas.addEventListener('touchstart', (e) => {
            touchStartTime = Date.now();
            touchStartY = e.touches[0].clientY;
            
            // Double tap detection
            const currentTime = new Date().getTime();
            const tapLength = currentTime - lastTap;
            if (tapLength < 500 && tapLength > 0) {
                this.toggleOverlay();
                e.preventDefault();
            }
            lastTap = currentTime;
        });
        
        // Swipe gestures for crossfader control
        let swipeStartY = 0;
        let isSweping = false;
        
        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            
            if (e.touches.length === 1 && !isSweping) {
                const touchY = e.touches[0].clientY;
                const deltaY = swipeStartY - touchY;
                
                if (Math.abs(deltaY) > 10) {
                    isSweping = true;
                    const crossfader = document.getElementById('main-crossfader');
                    const currentValue = parseInt(crossfader.value);
                    const sensitivity = window.innerHeight > 600 ? 0.3 : 0.5;
                    const newValue = Math.max(0, Math.min(100, currentValue + deltaY * sensitivity));
                    
                    crossfader.value = newValue;
                    this.crossfaderValue = newValue;
                    this.updateMixRatio();
                }
            }
        });
        
        this.canvas.addEventListener('touchstart', (e) => {
            if (e.touches.length === 1) {
                swipeStartY = e.touches[0].clientY;
                isSweping = false;
            }
        });
        
        this.canvas.addEventListener('touchend', () => {
            isSweping = false;
        });
        
        // Prevent default touch behaviors
        document.addEventListener('touchmove', (e) => {
            if (e.target === this.canvas) {
                e.preventDefault();
            }
        }, { passive: false });
    }
    
    // =========================================================================
    // Projection Mapping Setup
    // =========================================================================
    
    setupMapping() {
        // Check if MappingController is available
        if (typeof MappingController === 'undefined') {
            console.warn('MappingController not found, mapping feature disabled');
            const mappingBtn = document.getElementById('mapping-toggle-btn');
            if (mappingBtn) mappingBtn.style.display = 'none';
            return;
        }
        
        // Initialize mapping controller
        this.mappingController = new MappingController(this.canvas, {
            gridSize: { rows: 3, cols: 3 },
            pointRadius: 12
        });
        
        // UI Elements
        const mappingToggleBtn = document.getElementById('mapping-toggle-btn');
        const mappingToolbar = document.getElementById('mapping-toolbar');
        const mappingStatus = document.getElementById('mapping-status');
        const mappingCalibrateBtn = document.getElementById('mapping-calibrate-btn');
        const mappingGridSize = document.getElementById('mapping-grid-size');
        const mappingMergeBtn = document.getElementById('mapping-merge-btn');
        const mappingMaskBtn = document.getElementById('mapping-mask-btn');
        const mappingResetBtn = document.getElementById('mapping-reset-btn');
        const mappingSaveBtn = document.getElementById('mapping-save-btn');
        const mappingLoadBtn = document.getElementById('mapping-load-btn');
        const mappingDoneBtn = document.getElementById('mapping-done-btn');
        const mappingPresetModal = document.getElementById('mapping-preset-modal');
        const mappingPresetClose = document.getElementById('mapping-preset-close');
        const mappingPresetList = document.getElementById('mapping-preset-list');
        const mappingPresetName = document.getElementById('mapping-preset-name');
        const mappingPresetSaveConfirm = document.getElementById('mapping-preset-save-confirm');
        const mappingSaveActions = document.getElementById('mapping-save-actions');
        const mappingModalTitle = document.getElementById('mapping-modal-title');
        
        // Helper to update all UI states
        const updateMappingUI = () => {
            const enabled = this.mappingController.enabled;
            const calibrating = this.mappingController.calibrating;
            const mergeMode = this.mappingController.mergeMode;
            
            // Update toggle button
            mappingToggleBtn.classList.toggle('active', enabled && !calibrating);
            mappingToggleBtn.classList.toggle('calibrating', calibrating);
            
            // Update toolbar visibility - only show when calibrating
            mappingToolbar.classList.toggle('hide', !calibrating);
            
            // Update calibrate button
            mappingCalibrateBtn.classList.toggle('calibrating', calibrating);
            mappingCalibrateBtn.textContent = calibrating ? 'Done Calibrating' : 'Calibrate';
            
            // Update merge button
            if (mappingMergeBtn) {
                mappingMergeBtn.classList.toggle('active', mergeMode);
                mappingMergeBtn.classList.toggle('merging', mergeMode);
                mappingMergeBtn.textContent = mergeMode ? 'Confirm Merge' : 'Merge';
            }
            
            // Update mask mode button
            if (mappingMaskBtn) {
                const maskMode = this.mappingController.isMaskMode();
                mappingMaskBtn.classList.toggle('active', maskMode);
                mappingMaskBtn.textContent = maskMode ? 'Mask' : 'Warp';
            }
            
            // Update status indicator - show when mapping is active (even without calibrating)
            mappingStatus.classList.toggle('active', enabled);
            mappingStatus.classList.toggle('calibrating', calibrating);
            if (mergeMode) {
                mappingStatus.textContent = 'Merge Mode - Select cells';
            } else {
                mappingStatus.textContent = calibrating ? 'Calibrating...' : (enabled ? 'Mapping Active' : '');
            }
        };
        
        // Toggle mapping mode (🎯 button)
        // - If mapping is off: enable mapping + start calibration
        // - If mapping is on + calibrating: stop calibration (keep mapping active)
        // - If mapping is on + not calibrating: disable mapping entirely
        if (mappingToggleBtn) {
            mappingToggleBtn.addEventListener('click', () => {
                if (!this.mappingController.enabled) {
                    // Turn on mapping and start calibration
                    this.mappingController.enable();
                    this.mappingController.startCalibration();
                } else if (this.mappingController.calibrating) {
                    // Stop calibration but keep mapping active
                    this.mappingController.stopCalibration();
                } else {
                    // Mapping is on but not calibrating - disable entirely
                    this.mappingController.disable();
                }
                updateMappingUI();
            });
        }
        
        // Toggle calibration (Calibrate button in toolbar)
        if (mappingCalibrateBtn) {
            mappingCalibrateBtn.addEventListener('click', () => {
                this.mappingController.toggleCalibration();
                updateMappingUI();
            });
        }
        
        // Grid size selector
        if (mappingGridSize) {
            mappingGridSize.addEventListener('change', (e) => {
                const size = parseInt(e.target.value);
                this.mappingController.setGridSize(size, size);
            });
        }
        
        // Merge cells button
        if (mappingMergeBtn) {
            mappingMergeBtn.addEventListener('click', () => {
                if (this.mappingController.mergeMode) {
                    // Already in merge mode - try to confirm merge
                    if (this.mappingController.mergeSelection.length < 2) {
                        // Not enough cells selected - just exit merge mode
                        this.mappingController.disableMergeMode();
                    } else if (this.mappingController.isValidRectangularSelection()) {
                        // Valid selection - confirm merge
                        this.mappingController.confirmMerge();
                    } else {
                        // Invalid selection - show error in status
                        mappingStatus.textContent = 'Select a rectangle!';
                        setTimeout(() => updateMappingUI(), 1500);
                        return;
                    }
                } else {
                    // Enter merge mode
                    this.mappingController.enableMergeMode();
                }
                updateMappingUI();
            });
        }
        
        // Toggle mask mode button
        if (mappingMaskBtn) {
            mappingMaskBtn.addEventListener('click', () => {
                this.mappingController.toggleMaskMode();
                updateMappingUI();
            });
        }
        
        // Track modal mode to prevent handler conflicts
        // Using an object to ensure closure captures by reference, not value
        const modalState = { mode: 'save' }; // 'save' or 'reset'
        
        // Reset grid - use modal instead of confirm()
        if (mappingResetBtn) {
            mappingResetBtn.addEventListener('click', () => {
                // Use the mapping preset modal for confirmation
                modalState.mode = 'reset';
                console.log('Reset button clicked, setting mode to:', modalState.mode);
                mappingModalTitle.textContent = 'Reset Grid?';
                mappingPresetList.innerHTML = '<div style="text-align: center; color: #ccc; padding: 20px;">This will reset the grid to the default rectangle and clear all adjustments.</div>';
                mappingSaveActions.classList.remove('hide');
                mappingPresetName.style.display = 'none';
                mappingPresetSaveConfirm.textContent = 'Reset';
                mappingPresetModal.classList.remove('hide');
            });
        }
        
        // Save preset
        if (mappingSaveBtn) {
            mappingSaveBtn.addEventListener('click', () => {
                modalState.mode = 'save';
                console.log('Save button clicked, setting mode to:', modalState.mode);
                mappingModalTitle.textContent = 'Save Mapping Preset';
                mappingSaveActions.classList.remove('hide');
                mappingPresetName.style.display = '';
                mappingPresetName.value = '';
                mappingPresetSaveConfirm.textContent = 'Save';
                this.populateMappingPresetList(mappingPresetList, false);
                mappingPresetModal.classList.remove('hide');
            });
        }
        
        // Confirm save/reset preset - handles both modes
        if (mappingPresetSaveConfirm) {
            mappingPresetSaveConfirm.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                console.log('Confirm button clicked, current mode:', modalState.mode);
                
                if (modalState.mode === 'reset') {
                    // Reset mode - reset the grid
                    console.log('Executing reset...');
                    this.mappingController.resetGrid();
                    
                    if (this.mappingController.calibrating) {
                        // Already calibrating - just redraw the overlay to show reset grid
                        this.mappingController.drawOverlay();
                    } else {
                        // Not calibrating - start calibration to show the reset grid
                        this.mappingController.startCalibration();
                        updateMappingUI();
                    }
                    mappingPresetModal.classList.add('hide');
                    // Restore modal state for next use
                    mappingPresetName.style.display = '';
                    mappingPresetSaveConfirm.textContent = 'Save';
                    modalState.mode = 'save';
                } else {
                    // Save mode - save the preset
                    console.log('Executing save...');
                    const name = mappingPresetName.value.trim();
                    if (name) {
                        this.mappingController.savePreset(name);
                        mappingPresetModal.classList.add('hide');
                    } else {
                        alert('Please enter a preset name');
                    }
                }
            });
        }
        
        // Load preset
        if (mappingLoadBtn) {
            mappingLoadBtn.addEventListener('click', () => {
                mappingModalTitle.textContent = 'Load Mapping Preset';
                mappingSaveActions.classList.add('hide');
                this.populateMappingPresetList(mappingPresetList, true);
                mappingPresetModal.classList.remove('hide');
            });
        }
        
        // Close preset modal
        if (mappingPresetClose) {
            mappingPresetClose.addEventListener('click', () => {
                mappingPresetModal.classList.add('hide');
            });
        }
        
        // Done button - exit mapping mode entirely
        if (mappingDoneBtn) {
            mappingDoneBtn.addEventListener('click', () => {
                this.mappingController.disable();
                updateMappingUI();
            });
        }
        
        console.log('Mapping controller initialized');
    }
    
    populateMappingPresetList(container, forLoading) {
        const presets = this.mappingController.getPresets();
        const presetNames = Object.keys(presets).filter(name => name !== '__last__');
        
        container.innerHTML = '';
        
        if (presetNames.length === 0) {
            container.innerHTML = '<div style="text-align: center; color: #888; padding: 20px;">No saved presets</div>';
            return;
        }
        
        presetNames.forEach(name => {
            const preset = presets[name];
            const item = document.createElement('div');
            item.className = 'mapping-preset-item';
            
            const date = preset.created ? new Date(preset.created).toLocaleDateString() : '';
            
            item.innerHTML = `
                <span class="preset-name">${name}</span>
                <span class="preset-date">${date}</span>
                <button class="delete-btn" title="Delete">🗑️</button>
            `;
            
            // Click to load
            if (forLoading) {
                item.addEventListener('click', (e) => {
                    if (!e.target.classList.contains('delete-btn')) {
                        this.mappingController.loadPreset(name);
                        document.getElementById('mapping-preset-modal').classList.add('hide');
                    }
                });
            }
            
            // Delete button
            item.querySelector('.delete-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                if (confirm(`Delete preset "${name}"?`)) {
                    this.mappingController.deletePreset(name);
                    this.populateMappingPresetList(container, forLoading);
                }
            });
            
            container.appendChild(item);
        });
    }
    
    toggleControls() {
        const controls = document.getElementById('mobile-controls');
        const toggle = document.getElementById('expand-controls');
        
        controls.classList.toggle('expanded');
        controls.classList.toggle('collapsed');
        
        if (controls.classList.contains('expanded')) {
            toggle.textContent = '✕';
            toggle.style.background = 'rgba(230, 35, 35, 0.9)';
        } else {
            toggle.textContent = '⚙️';
            toggle.style.background = 'rgba(35, 230, 72, 0.9)';
        }
    }
    
    toggleOverlay() {
        const overlay = document.getElementById('screen-overlay');
        overlay.classList.toggle('hide');
        
        if (!overlay.classList.contains('hide')) {
            setTimeout(() => {
                overlay.classList.add('hide');
            }, 3000);
        }
    }
    
    toggleButterchurn() {
        this.butterchurnActive = !this.butterchurnActive;
        const btn = document.getElementById('butterchurn-enable');
        btn.classList.toggle('active');
        btn.textContent = this.butterchurnActive ? 'ON' : 'OFF';
    }
    
    toggleVideo() {
        this.videoActive = !this.videoActive;
        const btn = document.getElementById('video-enable');
        btn.classList.toggle('active');
        btn.textContent = this.videoActive ? 'ON' : 'OFF';
        
        if (this.videoActive && this.videoElement.src) {
            this.videoElement.play();
        } else {
            this.videoElement.pause();
        }
    }
    
    previousPreset() {
        if (this.presetKeys.length === 0) return;
        
        this.currentPresetIndex = this.currentPresetIndex > 0 ? 
            this.currentPresetIndex - 1 : 
            this.presetKeys.length - 1;
        this.loadPreset(this.presetKeys[this.currentPresetIndex]);
    }
    
    nextPreset() {
        if (this.presetKeys.length === 0) return;
        
        this.currentPresetIndex = (this.currentPresetIndex + 1) % this.presetKeys.length;
        this.loadPreset(this.presetKeys[this.currentPresetIndex]);
    }
    
    randomPreset() {
        if (this.presetKeys.length === 0) return;
        
        this.currentPresetIndex = Math.floor(Math.random() * this.presetKeys.length);
        this.loadPreset(this.presetKeys[this.currentPresetIndex]);
    }
    
    toggleAutoMode() {
        this.autoMode = !this.autoMode;
        const btn = document.getElementById('auto-mode');
        btn.classList.toggle('active');
        
        if (this.autoMode) {
            this.autoModeInterval = setInterval(() => {
                this.nextPreset();
            }, 15000); // Change preset every 15 seconds
            console.log('Auto mode enabled');
        } else {
            if (this.autoModeInterval) {
                clearInterval(this.autoModeInterval);
                this.autoModeInterval = null;
            }
            console.log('Auto mode disabled');
        }
    }
    
    toggleFavorite() {
        if (this.presetKeys.length === 0) return;
        
        const currentPreset = this.presetKeys[this.currentPresetIndex];
        const isFavorite = this.favoritePresets.includes(currentPreset);
        
        if (isFavorite) {
            // Remove from favorites
            this.favoritePresets = this.favoritePresets.filter(p => p !== currentPreset);
            console.log(`Removed "${currentPreset}" from favorites`);
        } else {
            // Add to favorites
            this.favoritePresets.push(currentPreset);
            console.log(`Added "${currentPreset}" to favorites`);
        }
        
        this.saveFavoritePresets();
        this.updateFavoriteButton();
        
        // If currently showing favorites and removed one, update the list
        if (this.showingFavorites && !isFavorite === false) {
            this.updatePresetList();
            // Adjust current index if needed
            if (this.currentPresetIndex >= this.presetKeys.length) {
                this.currentPresetIndex = Math.max(0, this.presetKeys.length - 1);
            }
            if (this.presetKeys.length > 0) {
                this.loadPreset(this.presetKeys[this.currentPresetIndex]);
            }
        }
    }
    
    updateFavoriteButton() {
        if (this.presetKeys.length === 0) return;
        
        const currentPreset = this.presetKeys[this.currentPresetIndex];
        const isFavorite = this.favoritePresets.includes(currentPreset);
        const btn = document.getElementById('favorite-preset');
        
        if (btn) {
            btn.classList.toggle('active', isFavorite);
            btn.textContent = isFavorite ? '❤️' : '🤍';
            btn.title = isFavorite ? 'Remove from favorites' : 'Add to favorites';
        }
    }
    
    togglePresetMode() {
        this.showingFavorites = !this.showingFavorites;
        this.updatePresetList();
        this.updatePresetModeButton();
        
        if (this.presetKeys.length > 0) {
            this.loadPreset(this.presetKeys[0]);
        }
    }
    
    updatePresetModeButton() {
        const btn = document.getElementById('preset-mode');
        if (btn) {
            btn.textContent = this.showingFavorites ? '📋' : '❤️';
            btn.title = this.showingFavorites ? 'Show all presets' : 'Show favorites only';
            btn.classList.toggle('active', !this.showingFavorites);
        }
    }
    
    showPresetManager() {
        document.getElementById('preset-manager-modal').classList.remove('hide');
        this.updatePresetManagerStats();
        this.populatePresetManager();
    }
    
    updatePresetManagerStats() {
        document.getElementById('favorites-count').textContent = `${this.favoritePresets.length} favorites`;
        document.getElementById('total-count').textContent = `${Object.keys(this.allPresets).length} total presets`;
    }
    
    hidePresetManager() {
        document.getElementById('preset-manager-modal').classList.add('hide');
    }
    
    populatePresetManager() {
        const container = document.getElementById('preset-manager-list');
        container.innerHTML = '';
        
        // Group presets by author/type
        const groupedPresets = {};
        Object.keys(this.allPresets).forEach(preset => {
            const parts = preset.split(' - ');
            const author = parts[0] || 'Unknown';
            if (!groupedPresets[author]) {
                groupedPresets[author] = [];
            }
            groupedPresets[author].push(preset);
        });
        
        // Create grouped list
        Object.keys(groupedPresets).sort().forEach(author => {
            const group = document.createElement('div');
            group.className = 'preset-group';
            
            const header = document.createElement('h4');
            header.textContent = `${author} (${groupedPresets[author].length})`;
            group.appendChild(header);
            
            groupedPresets[author].forEach(preset => {
                const item = document.createElement('div');
                item.className = 'preset-item';
                
                const isFavorite = this.favoritePresets.includes(preset);
                item.innerHTML = `
                    <span class="preset-name" title="${preset}">${this.shortenPresetName(preset)}</span>
                    <button class="preset-fav-btn ${isFavorite ? 'active' : ''}" 
                            data-preset="${preset}">
                        ${isFavorite ? '❤️' : '🤍'}
                    </button>
                `;
                
                group.appendChild(item);
            });
            
            container.appendChild(group);
        });
        
        // Add event listeners to favorite buttons
        container.querySelectorAll('.preset-fav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const preset = btn.dataset.preset;
                const isFavorite = this.favoritePresets.includes(preset);
                
                if (isFavorite) {
                    this.favoritePresets = this.favoritePresets.filter(p => p !== preset);
                    btn.classList.remove('active');
                    btn.textContent = '🤍';
                } else {
                    this.favoritePresets.push(preset);
                    btn.classList.add('active');
                    btn.textContent = '❤️';
                }
                
                this.saveFavoritePresets();
                this.updatePresetManagerStats();
                
                // Update main UI if showing favorites
                if (this.showingFavorites) {
                    this.updatePresetList();
                }
            });
        });
    }
    
    handleVideoUpload(event) {
        const file = event.target.files[0];
        if (file) {
            const url = URL.createObjectURL(file);
            const isGif = file.type === 'image/gif';
            this.loadVideoToSlot(0, url, file.name, isGif);
        }
    }
    
    loadVideoToSlot(slotIndex, url, name, isGif = false) {
        console.log('💾 Saving to slot', slotIndex, ':', { url, name, isGif });
        this.videoSlots[slotIndex] = { url, name, isGif };
        
        // Update slot UI
        const slot = document.querySelectorAll('.video-slot')[slotIndex];
        if (!slot) {
            console.error('❌ Slot element not found for index:', slotIndex);
            return;
        }
        
        slot.classList.add('loaded');
        const shortName = name.length > 8 ? name.substring(0, 8) + '...' : name;
        slot.querySelector('span').textContent = shortName;
        
        // Create thumbnail
        this.createThumbnail(slotIndex, url, isGif);
        
        // Pre-load GIF in background for instant playback later
        if (isGif) {
            console.log('🔄 Pre-loading GIF for slot', slotIndex);
            this.loadGif(url, slotIndex);
        }
        
        // Send slot info to controller
        this.sendToController({
            type: 'video_slot_update',
            slot: slotIndex,
            url: url,
            name: name,
            isGif: isGif
        });
        
        // Auto-select this slot
        this.selectVideoSlot(slotIndex);
    }
    
    createThumbnail(slotIndex, url, isGif) {
        const slot = document.querySelectorAll('.video-slot')[slotIndex];
        const preview = slot.querySelector('.slot-preview');
        
        if (isGif) {
            // For GIFs, show the GIF directly as preview
            preview.style.backgroundImage = `url(${url})`;
            preview.style.backgroundSize = 'cover';
            preview.style.backgroundPosition = 'center';
            console.log('✅ Thumbnail set for GIF slot', slotIndex);
        } else {
            // For videos, create a quick thumbnail
            const video = document.createElement('video');
            video.crossOrigin = 'anonymous';
            video.muted = true;
            video.playsInline = true;
            
            video.addEventListener('loadeddata', () => {
                video.currentTime = 1; // Seek to 1 second
            });
            
            video.addEventListener('seeked', () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                canvas.width = 64;
                canvas.height = 36;
                ctx.drawImage(video, 0, 0, 64, 36);
                preview.style.backgroundImage = `url(${canvas.toDataURL()})`;
            });
            
            video.src = url;
        }
    }
    
    selectVideoSlot(slotIndex) {
        console.log('🎬 Selecting video slot:', slotIndex, 'Data:', this.videoSlots[slotIndex]);
        if (!this.videoSlots[slotIndex]) {
            console.warn('⚠️ Slot', slotIndex, 'is empty');
            return;
        }
        
        // Update UI
        document.querySelectorAll('.video-slot').forEach((slot, i) => {
            slot.classList.toggle('active', i === slotIndex);
        });
        
        // Set current video
        this.currentVideo = slotIndex;
        this.videoActive = true;
        
        const videoData = this.videoSlots[slotIndex];
        console.log('📹 Switching to slot:', slotIndex, 'URL:', videoData.url, 'isGif:', videoData.isGif);
        
        if (videoData.isGif) {
            // Check if GIF is already loaded in this slot
            if (this.gifPlayers[slotIndex] || this.gifImageElements[slotIndex]) {
                console.log('✅ GIF already loaded in slot', slotIndex, '- instant switch!');
                this.gifImageLoaded = true;
                
                // Stop video playback
                this.videoElement.pause();
                this.videoElement.src = '';
            } else {
                // GIF not loaded yet, load it now
                console.log('⏳ GIF not preloaded, loading now...');
                this.gifImageLoaded = false;
                this.loadGif(videoData.url, slotIndex);
            }
        } else {
            // Regular video
            this.gifImageLoaded = false;
            this.loadVideo(videoData.url);
        }
        
        // Update status
        this.updateVideoStatus('▶ Playing');
        document.getElementById('video-enable').classList.add('active');
        document.getElementById('video-enable').textContent = 'ON';
    }
    
    loadVideo(url) {
        this.videoElement.src = url;
        this.videoElement.playbackRate = this.videoEffects.speed;
        this.videoElement.play().catch(error => {
            console.error('Video play failed:', error);
            this.updateVideoStatus('❌ Error');
        });
        
        this.gifPlayer = null;
        this.gifImageLoaded = false;
    }
    
    loadGif(url, slotIndex) {
        console.log('🎨 Loading GIF into slot', slotIndex, ':', url);
        
        // Stop video playback when switching to GIF
        this.videoElement.pause();
        this.videoElement.src = '';
        
        // Try to use GIF parser for better control
        const parser = new GIFParser();
        parser.parseFromURL(url)
            .then(gifData => {
                console.log(`✅ GIF parsed successfully for slot ${slotIndex}: ${gifData.frames.length} frames`);
                
                // Store the player in the slot
                this.gifPlayers[slotIndex] = new GIFPlayer(gifData);
                this.gifPlayers[slotIndex].play();
                
                // If this is the currently active slot, mark as loaded
                if (this.currentVideo === slotIndex) {
                    this.gifImageLoaded = true;
                    this.updateVideoStatus('▶ Playing GIF');
                }
                
                console.log('✅ GIF player stored in slot', slotIndex);
            })
            .catch(error => {
                console.warn(`⚠️ GIF parser failed for slot ${slotIndex}, using fallback:`, error);
                
                // Fallback: Use native img element
                if (!this.gifImageElements[slotIndex]) {
                    this.gifImageElements[slotIndex] = document.createElement('img');
                    this.gifImageElements[slotIndex].style.display = 'none';
                    document.body.appendChild(this.gifImageElements[slotIndex]);
                }
                
                this.gifImageElements[slotIndex].onload = () => {
                    console.log(`✅ GIF loaded using native image for slot ${slotIndex}`);
                    
                    // If this is the currently active slot, mark as loaded
                    if (this.currentVideo === slotIndex) {
                        this.gifImageLoaded = true;
                        this.updateVideoStatus('▶ Playing GIF');
                    }
                };
                
                this.gifImageElements[slotIndex].onerror = () => {
                    console.error(`❌ Failed to load GIF for slot ${slotIndex}`);
                    if (this.currentVideo === slotIndex) {
                        this.updateVideoStatus('❌ GIF Error');
                        this.gifImageLoaded = false;
                    }
                };
                
                this.gifImageElements[slotIndex].crossOrigin = 'anonymous';
                this.gifImageElements[slotIndex].src = url;
            });
    }
    
    toggleVideoEffect(effect) {
        this.videoEffects[effect] = !this.videoEffects[effect];
        
        const btn = document.querySelector(`[data-effect="${effect}"]`);
        btn.classList.toggle('active');
        
        // Apply effect immediately
        this.applyVideoEffect(effect);
    }
    
    applyVideoEffect(effect) {
        switch (effect) {
            case 'reverse':
                if (this.videoElement.src) {
                    this.videoElement.playbackRate = this.videoEffects.reverse ? 
                        -this.videoEffects.speed : this.videoEffects.speed;
                }
                break;
                
            case 'speed':
                if (this.videoElement.src && !this.videoEffects.reverse) {
                    this.videoElement.playbackRate = this.videoEffects.speed * 2;
                }
                break;
        }
    }
    
    showEffectsPanel() {
        document.getElementById('effects-panel').classList.remove('hide');
        document.getElementById('effects-panel').classList.add('show');
    }
    
    hideEffectsPanel() {
        document.getElementById('effects-panel').classList.remove('show');
        setTimeout(() => {
            document.getElementById('effects-panel').classList.add('hide');
        }, 300);
    }
    
    showSetupModal() {
        document.getElementById('setup-modal').classList.remove('hide');
    }
    
    async hideSetupModal() {
        document.getElementById('setup-modal').classList.add('hide');
        
        // Resume audio context on user interaction
        if (this.audioContext && this.audioContext.state === 'suspended') {
            try {
                await this.audioContext.resume();
                console.log('Audio context resumed after user interaction');
            } catch (error) {
                console.warn('Could not resume audio context:', error);
            }
        }
    }
    
    showDebugInfo() {
        const info = [
            `🎵 Hydra Mobile Debug`,
            ``,
            `Butterchurn:`,
            `  Active: ${this.butterchurnActive}`,
            `  Renderer: ${!!this.butterchurnRenderer}`,
            `  Canvas: ${!!this.butterchurnCanvas}`,
            ``,
            `Audio:`,
            `  Context: ${this.audioContext?.state || 'none'}`,
            `  Source: ${!!this.audioSource}`,
            ``,
            `Video:`,
            `  Active: ${this.videoActive}`,
            `  Element: ${!!this.videoElement}`,
            `  Size: ${this.videoElement?.videoWidth || 0}x${this.videoElement?.videoHeight || 0}`,
            ``,
            `Settings:`,
            `  Crossfader: ${this.crossfaderValue}%`,
            `  Current Preset: ${this.presetKeys[this.currentPresetIndex] || 'none'}`,
            `  Total Presets: ${this.presetKeys.length}`,
            `  Favorites: ${this.favoritePresets.length}`,
            `  Mode: ${this.showingFavorites ? 'Favorites' : 'All'}`,
            ``,
            `Performance:`,
            `  Canvas Size: ${this.canvas?.width || 0}x${this.canvas?.height || 0}`,
            `  DPR: ${window.devicePixelRatio || 1}`
        ];
        
        alert(info.join('\n'));
        
        // Also log to console for developers
        console.log('🎵 Hydra Mobile Debug:', {
            butterchurn: {
                active: this.butterchurnActive,
                renderer: !!this.butterchurnRenderer,
                canvas: !!this.butterchurnCanvas
            },
            audio: {
                context: this.audioContext?.state,
                source: !!this.audioSource
            },
            video: {
                active: this.videoActive,
                element: !!this.videoElement,
                size: `${this.videoElement?.videoWidth || 0}x${this.videoElement?.videoHeight || 0}`
            },
            presets: {
                current: this.presetKeys[this.currentPresetIndex],
                total: this.presetKeys.length,
                favorites: this.favoritePresets.length,
                mode: this.showingFavorites ? 'favorites' : 'all'
            }
        });
    }
    
    async requestMicrophone() {
        try {
            // First, ensure audio context is running
            if (this.audioContext.state === 'suspended') {
                console.log('Resuming audio context...');
                try {
                    await this.audioContext.resume();
                    console.log('Audio context resumed successfully');
                } catch (resumeError) {
                    console.error('Failed to resume audio context:', resumeError);
                    throw new Error('Could not resume audio context');
                }
            }
            
            console.log('Requesting microphone access...');
            console.log('Audio context sample rate:', this.audioContext.sampleRate);
            
            const stream = await navigator.mediaDevices.getUserMedia({ 
                audio: {
                    echoCancellation: false,
                    noiseSuppression: false,
                    autoGainControl: false
                } 
            });
            
            console.log('Microphone access granted, stream obtained:', stream);
            
            // Stop silent oscillator if it exists
            if (this.silentOscillator) {
                try {
                    this.silentOscillator.stop();
                    console.log('Silent oscillator stopped');
                } catch (e) {
                    console.warn('Could not stop silent oscillator:', e);
                }
                this.silentOscillator = null;
            }
            
            // Create media stream source
            console.log('Creating media stream source...');
            this.audioSource = this.audioContext.createMediaStreamSource(stream);
            
            // Create a GainNode for microphone sensitivity control
            this.micGainNode = this.audioContext.createGain();
            this.micGainNode.gain.value = this.micSensitivity;
            this.audioSource.connect(this.micGainNode);
            console.log('Audio source connected to gain node');

            if (this.butterchurnRenderer) {
                // Disconnect silent oscillator if it was connected
                if (this.silentGain) {
                    try {
                        this.silentGain.disconnect(this.audioContext.destination);
                        console.log('Silent gain disconnected');
                    } catch (e) {
                        console.warn('Could not disconnect silent gain:', e);
                    }
                }
                
                console.log('Connecting microphone to butterchurn...');
                try {
                    this.butterchurnRenderer.connectAudio(this.micGainNode);
                    console.log('Microphone connected to butterchurn via GainNode');
                } catch (connectError) {
                    console.error('Failed to connect audio to butterchurn:', connectError);
                    // Try to continue anyway - the connection might still work
                }
            } else {
                console.warn('Butterchurn renderer not available for audio connection');
            }
            
            document.querySelector('.audio-status').textContent = '🎤 Live';
            document.getElementById('enable-mic').textContent = '✅ Microphone Enabled';
            document.getElementById('enable-mic').disabled = true;
            
            console.log('Microphone setup completed successfully');
            
        } catch (error) {
            console.error('Microphone access error:', error);
            console.error('Error name:', error.name);
            console.error('Error message:', error.message);
            
            // Provide more specific error messages
            let errorMessage = 'Microphone access failed. Using silent audio source for visual effects.';
            
            if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
                errorMessage = 'Microphone permission denied. Please allow microphone access in your browser settings.';
            } else if (error.name === 'NotFoundError') {
                errorMessage = 'No microphone found on your device.';
            } else if (error.name === 'NotReadableError') {
                errorMessage = 'Microphone is already in use by another application.';
            } else if (error.message.includes('audio context')) {
                errorMessage = 'Audio system error. Please refresh the page and try again.';
            }
            
            document.querySelector('.audio-status').textContent = '🔇 Error';
            alert(errorMessage);
        }
    }
    
    loadVideoFromURL() {
        const url = document.getElementById('direct-url').value.trim();
        if (url) {
            try {
                new URL(url); // Validate URL
                const isGif = url.toLowerCase().includes('.gif') || url.toLowerCase().includes('giphy');
                const name = isGif ? 'GIF' : 'Video';
                this.loadVideoToSlot(1, url, name, isGif);
                document.getElementById('direct-url').value = '';
                this.hideSetupModal();
            } catch (error) {
                alert('Please enter a valid URL');
            }
        }
    }
    
    loadVideoFromURLEffectsPanel() {
        const url = document.getElementById('effects-panel-url').value.trim();
        console.log('🌐 Loading URL from effects panel:', url);
        if (url) {
            try {
                new URL(url); // Validate URL
                const isGif = url.toLowerCase().includes('.gif') || url.toLowerCase().includes('giphy');
                const name = isGif ? 'GIF' : 'Video';
                console.log('📝 Detected type:', name, 'isGif:', isGif);
                // Find first empty slot or use slot 0
                let targetSlot = -1;
                for (let i = 0; i < this.videoSlots.length; i++) {
                    if (!this.videoSlots[i]) {
                        targetSlot = i;
                        break;
                    }
                }
                
                // If no empty slot found, show alert
                if (targetSlot === -1) {
                    console.warn('⚠️ All video slots are full. Cannot load more videos.');
                    alert('All 6 video slots are full. Please clear a slot before loading a new video.');
                    return;
                }
                
                this.loadVideoToSlot(targetSlot, url, name, isGif);
                document.getElementById('effects-panel-url').value = '';
                // Don't close effects panel, keep it open
            } catch (error) {
                console.error('❌ Invalid URL:', error);
                alert('Please enter a valid URL');
            }
        } else {
            alert('Please enter a URL');
        }
    }
    
    updateMixRatio() {
        // Update visual indicator
        const ratio = this.crossfaderValue / 100;
        const effect = ratio < 0.5 ? 'Butterchurn' : ratio > 0.5 ? 'Video' : 'Mixed';
        document.getElementById('current-effect').textContent = effect;
    }
    
    startRender() {
        let lastTime = 0;
        const targetFPS = 60;
        const frameTime = 1000 / targetFPS;
        
        const render = (currentTime) => {
            if (currentTime - lastTime >= frameTime) {
                this.renderFrame();
                lastTime = currentTime;
            }
            requestAnimationFrame(render);
        };
        
        requestAnimationFrame(render);
        console.log('Render loop started');
    }
    
    renderFrame() {
        try {
            // Clear canvas
            this.ctx.fillStyle = '#000';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

            const ratio = this.crossfaderValue / 100;

            // Debug info (remove in production)
            if (Math.random() < 0.01) { // Log every ~100 frames
                console.log('Render state:', {
                    butterchurnActive: this.butterchurnActive,
                    hasRenderer: !!this.butterchurnRenderer,
                    videoActive: this.videoActive,
                    hasVideo: (this.videoElement && this.videoElement.videoWidth > 0) || this.gifImageLoaded,
                    gifImageLoaded: this.gifImageLoaded,
                    hasGifPlayer: !!this.gifPlayer,
                    hasGifImageEl: !!this.gifImageEl,
                    crossfaderRatio: ratio
                });
            }

            // Render Butterchurn (always at 1-ratio for crossfading)
            if (this.butterchurnActive && this.butterchurnRenderer && ratio < 1) {
                try {
                    // Render butterchurn to its WebGL canvas
                    this.butterchurnRenderer.setRendererSize(this.butterchurnCanvas.width, this.butterchurnCanvas.height);
                    this.butterchurnRenderer.render();

                    // Composite butterchurn canvas to main canvas
                    this.ctx.globalAlpha = 1 - ratio;
                    this.ctx.globalCompositeOperation = 'source-over';
                    this.ctx.drawImage(this.butterchurnCanvas, 0, 0,
                        this.canvas.width / (window.devicePixelRatio || 1),
                        this.canvas.height / (window.devicePixelRatio || 1));

                } catch (error) {
                    // Butterchurn render errors are common during preset transitions
                    console.warn('Butterchurn render error:', error);
                }
            }

            // Render Video or GIF with blend mode
            const hasVideoOrGif = (this.videoElement.videoWidth > 0) || this.gifImageLoaded;
            if (this.videoActive && hasVideoOrGif && ratio > 0) {
                // Apply the selected blend mode - this determines how video blends with butterchurn
                this.ctx.globalCompositeOperation = this.blendMode;
                this.ctx.globalAlpha = ratio;
                
                // Always log blend mode rendering for debugging
                if (Math.random() < 0.05) { // Log 5% of frames
                    console.log('🎨 RENDERING with blend mode:', this.blendMode, 'alpha:', ratio.toFixed(2), 'butterchurn:', (1-ratio).toFixed(2));
                }
                
                this.renderVideo();
                
                // Reset to defaults
                this.ctx.globalCompositeOperation = 'source-over';
                this.ctx.globalAlpha = 1.0;
            }

            // Ensure everything is reset
            this.ctx.globalAlpha = 1;
            this.ctx.globalCompositeOperation = 'source-over';
            
            // Render through mapping controller if enabled
            if (this.mappingController && this.mappingController.enabled) {
                this.mappingController.render();
            }
        } catch (error) {
            console.warn('Render frame error:', error);
        }
    }
    
    // Remote Control Functions
    connectToRemoteControl() {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        
        // Allow WebSocket server to be specified via URL parameter
        // Otherwise, use the same host where the page was loaded from
        const urlParams = new URLSearchParams(window.location.search);
        let wsHost = urlParams.get('ws');
        
        if (!wsHost) {
            // If accessed from the same server, use that server's IP
            // This ensures remote clients connect back to the server, not to themselves
            wsHost = window.location.host.split(':')[0]; // Remove port if present
        }
        
        // Use /remote-control path on same server and port
        const wsUrl = `${protocol}//${window.location.host}/remote-control`;
        
        console.log('🔗 Attempting to connect to remote control server:', wsUrl);
        console.log('🔗 WebSocket Host:', wsHost);
        console.log('🔗 Page loaded from:', window.location.host);
        
        try {
            this.ws = new WebSocket(wsUrl);
            this.setupRemoteControlHandlers();
        } catch (error) {
            console.warn('⚠️ Remote control server not available:', error);
            this.updateRemoteStatus(false, 'Server unavailable');
        }
    }
    
    setupRemoteControlHandlers() {
        this.ws.onopen = () => {
            console.log('✅ Connected to remote control server');
            this.isConnectedToController = true;
            this.updateRemoteStatus(true, 'Remote control active');
            
            // Register as display client
            this.sendToController({
                type: 'register',
                clientType: 'display',
                clientName: `Mobile Display ${new Date().toLocaleTimeString()}`
            });

            // Send available presets to the controller
            console.log('DEBUG: mobile-hydra.js - this.allPresets keys before sending:', Object.keys(this.allPresets).length);
            console.log('DEBUG: mobile-hydra.js - this.presetKeys before sending (should be favorites):', this.presetKeys.length);
            this.sendToController({
                type: 'preset_list',
                presets: Object.keys(this.allPresets) // Always send all presets to controller
            });
        };
        
        this.ws.onmessage = (event) => {
            try {
                const message = JSON.parse(event.data);
                this.handleRemoteCommand(message);
            } catch (error) {
                console.error('❌ Invalid remote command:', error);
            }
        };
        
        this.ws.onclose = () => {
            console.log('🔌 Disconnected from remote control server');
            this.isConnectedToController = false;
            this.updateRemoteStatus(false, 'Local control only');
        };
        
        this.ws.onerror = (error) => {
            console.warn('⚠️ Remote control connection error:', error);
        };
    }
    
    sendToController(message) {
        if (this.isConnectedToController && this.ws.readyState === WebSocket.OPEN) {
            message.timestamp = Date.now();
            this.ws.send(JSON.stringify(message));
        }
    }
    
    handleRemoteCommand(message) {
        // Don't log heartbeat messages to reduce console noise
        if (message.type !== 'heartbeat') {
            console.log('📨 Remote command:', message.type, message);
        }
        
        // Log blend_mode specifically
        if (message.type === 'blend_mode') {
            console.log('🎨 BLEND MODE MESSAGE RECEIVED:', message);
        }
        
        // Save state before emergency commands
        if (message.type === 'emergency' && !this.emergencyMode) {
            this.lastKnownState = this.captureCurrentState();
        }
        
        switch (message.type) {
            case 'crossfader':
                this.handleRemoteCrossfader(message);
                break;
                
            case 'preset':
                this.handleRemotePreset(message);
                break;
                
            case 'video':
                this.handleRemoteVideo(message);
                break;
                
            case 'effect':
                this.handleRemoteEffect(message);
                break;
                
            case 'emergency':
                this.handleEmergencyCommand(message);
                break;
                
            case 'beat_sync':
                this.handleBeatSync(message);
                break;
                
            case 'scene':
                this.handleRemoteScene(message);
                break;
                
            case 'config':
                this.handleRemoteConfig(message);
                break;
                
            case 'heartbeat':
                // Respond to heartbeat
                this.sendToController({ type: 'heartbeat' });
                break;

            case 'mic_sensitivity':
                this.handleMicSensitivity(message);
                break;
            
            case 'blend_mode':
                this.handleBlendMode(message);
                break;
        }
    }
    
    handleRemoteCrossfader(message) {
        if (message.value !== undefined) {
            this.crossfaderValue = message.value;
            document.getElementById('main-crossfader').value = this.crossfaderValue;
            this.updateMixRatio();
        }
    }

    handleMicSensitivity(message) {
        if (message.value !== undefined) {
            this.setMicrophoneSensitivity(message.value);
        }
    }
    
    handleBlendMode(message) {
        if (message.mode) {
            const oldMode = this.blendMode;
            this.blendMode = message.mode;
            console.log('🎨🎨🎨 BLEND MODE CHANGED 🎨🎨🎨');
            console.log('   Old mode:', oldMode);
            console.log('   New mode:', this.blendMode);
            console.log('   butterchurnActive:', this.butterchurnActive);
            console.log('   videoActive:', this.videoActive);
            console.log('   crossfader:', this.crossfaderValue);
            
            // Show visual feedback on screen
            this.showBlendModeNotification(this.blendMode);
        }
    }
    
    showBlendModeNotification(mode) {
        // Create a temporary notification element
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            font-size: 18px;
            font-weight: bold;
            z-index: 10000;
            border: 2px solid #4a9eff;
        `;
        notification.textContent = `Blend Mode: ${mode}`;
        document.body.appendChild(notification);
        
        // Remove after 2 seconds
        setTimeout(() => {
            notification.remove();
        }, 2000);
    }

    setMicrophoneSensitivity(value) {
        this.micSensitivity = parseFloat(value);
        if (this.micGainNode) {
            this.micGainNode.gain.value = this.micSensitivity;
            console.log('🎤 Microphone sensitivity set to:', this.micSensitivity);
        }
        // Update UI if there's a local control for it (e.g., in setup modal)
        const slider = document.getElementById('mic-sensitivity-slider');
        if (slider) {
            slider.value = this.micSensitivity;
        }
        const display = document.getElementById('mic-sensitivity-display');
        if (display) {
            display.textContent = `${(this.micSensitivity * 100).toFixed(0)}%`;
        }
    }
    
    handleRemotePreset(message) {
        switch (message.action) {
            case 'toggle':
                this.butterchurnActive = message.enabled;
                document.getElementById('butterchurn-enable').classList.toggle('active', this.butterchurnActive);
                document.getElementById('butterchurn-enable').textContent = this.butterchurnActive ? 'ON' : 'OFF';
                break;
                
            case 'prev':
                this.previousPreset();
                break;
                
            case 'next':
                this.nextPreset();
                break;
                
            case 'random':
                this.randomPreset();
                break;
                
            case 'auto':
                if (message.enabled !== this.autoMode) {
                    this.toggleAutoMode();
                }
                break;
                
            case 'favorite':
                this.toggleFavorite();
                break;

            case 'load_by_name':
                if (message.presetName) {
                    this.loadPreset(message.presetName.trim());
                }
                break;
        }
    }
    
    handleRemoteVideo(message) {
        switch (message.action) {
            case 'toggle':
                this.videoActive = message.enabled;
                document.getElementById('video-enable').classList.toggle('active', this.videoActive);
                document.getElementById('video-enable').textContent = this.videoActive ? 'ON' : 'OFF';
                
                if (this.videoActive && this.videoElement.src) {
                    this.videoElement.play();
                } else {
                    this.videoElement.pause();
                }
                break;
                
            case 'select_slot':
                this.selectVideoSlot(message.slot); // Already 0-based index
                break;
                
            case 'load_url':
                const slotIndex = message.slot !== undefined ? message.slot : 0;
                console.log('📥 Remote load_url: loading to slot', slotIndex, '(message.slot=', message.slot, ')');
                
                // Validate slot index is within bounds
                if (slotIndex < 0 || slotIndex >= this.videoSlots.length) {
                    console.warn('⚠️ Invalid slot index:', slotIndex, 'max slots:', this.videoSlots.length);
                    break;
                }
                
                this.loadVideoToSlot(slotIndex, message.url, 'Remote Video', message.url.toLowerCase().includes('.gif'));
                break;
        }
    }
    
    handleRemoteEffect(message) {
        const effect = message.effect;
        
        if (effect === 'speed') {
            this.videoEffects.speed = message.value;
            document.getElementById('video-speed').value = this.videoEffects.speed;
            if (this.videoElement && !this.videoEffects.reverse) {
                this.videoElement.playbackRate = this.videoEffects.speed;
            }
        } else if (this.videoEffects.hasOwnProperty(effect)) {
            this.videoEffects[effect] = message.enabled || message.value;
            this.applyVideoEffect(effect);
        }
    }
    
    handleEmergencyCommand(message) {
        switch (message.action) {
            case 'stop':
            case 'blackout':
                this.activateEmergencyMode('blackout');
                break;
                
            case 'audio-only':
                this.activateEmergencyMode('audio-only');
                break;
                
            case 'video-only':
                this.activateEmergencyMode('video-only');
                break;
                
            case 'restore':
                this.deactivateEmergencyMode();
                break;
        }
    }
    
    handleBeatSync(message) {
        if (message.bpm) {
            // TODO: Implement BPM sync for auto-mode timing
            console.log('🥁 BPM sync:', message.bpm);
        }
    }
    
    handleRemoteScene(message) {
        switch (message.action) {
            case 'save':
                this.saveScene(message.slot);
                break;

            case 'load':
                this.loadScene(message.slot);
                break;

            case 'clear':
                this.clearScene(message.slot);
                break;
        }
        console.log('🎬 Scene command:', message.action, message.slot);
    }

    saveScene(slot) {
        if (slot < 1 || slot > 8) {
            console.warn('Invalid scene slot:', slot);
            return;
        }

        const state = this.captureCurrentState();
        state.timestamp = Date.now();
        state.name = `Scene ${slot}`;

        this.scenes[slot] = state;
        this.saveScenesToStorage();

        console.log(`💾 Scene ${slot} saved:`, state);
    }

    loadScene(slot) {
        if (slot < 1 || slot > 8) {
            console.warn('Invalid scene slot:', slot);
            return;
        }

        const scene = this.scenes[slot];
        if (!scene) {
            console.warn(`Scene ${slot} not found`);
            return;
        }

        console.log(`📂 Loading scene ${slot}:`, scene);
        this.restoreState(scene);
        this.currentScene = slot;

        // Send confirmation to controller
        this.sendToController({
            type: 'scene_loaded',
            slot: slot,
            scene: scene
        });
    }

    clearScene(slot) {
        if (slot < 1 || slot > 8) {
            console.warn('Invalid scene slot:', slot);
            return;
        }

        delete this.scenes[slot];
        this.saveScenesToStorage();

        console.log(`🗑️ Scene ${slot} cleared`);
    }

    saveScenesToStorage() {
        try {
            localStorage.setItem('hydra-mobile-scenes', JSON.stringify(this.scenes));
        } catch (error) {
            console.warn('Could not save scenes to localStorage:', error);
        }
    }

    loadScenesFromStorage() {
        try {
            const saved = localStorage.getItem('hydra-mobile-scenes');
            if (saved) {
                this.scenes = JSON.parse(saved);
                console.log(`Loaded ${Object.keys(this.scenes).length} saved scenes`);
            }
        } catch (error) {
            console.warn('Error loading scenes from localStorage:', error);
        }
    }
    
    handleRemoteConfig(message) {
        switch (message.action) {
            case 'fullscreen':
                this.toggleFullscreen();
                break;
            
            case 'initial_state':
                // Display just connected, request video slots from control panel
                console.log('📡 Display connected, requesting video slot state');
                this.sendToController({
                    type: 'request_video_slots'
                });
                break;
            
            case 'request_preset_list':
                // Send preset list to controller when requested
                console.log('📤 Sending preset list on request:', Object.keys(this.allPresets).length, 'presets');
                this.sendToController({
                    type: 'preset_list',
                    presets: Object.keys(this.allPresets)
                });
                break;
        }
    }
    
    // Emergency Mode
    activateEmergencyMode(mode) {
        this.emergencyMode = true;
        this.remoteControlEnabled = true;
        
        console.log(`🚨 Emergency mode: ${mode}`);
        
        switch (mode) {
            case 'blackout':
                this.butterchurnActive = false;
                this.videoActive = false;
                this.crossfaderValue = 0;
                break;
                
            case 'audio-only':
                this.butterchurnActive = true;
                this.videoActive = false;
                this.crossfaderValue = 0;
                break;
                
            case 'video-only':
                this.butterchurnActive = false;
                this.videoActive = true;
                this.crossfaderValue = 100;
                break;
        }
        
        this.updateAllControls();
        this.showEmergencyIndicator(mode);
    }
    
    deactivateEmergencyMode() {
        if (this.lastKnownState) {
            console.log('🔄 Restoring previous state');
            this.restoreState(this.lastKnownState);
            this.lastKnownState = null;
        }
        
        this.emergencyMode = false;
        this.hideEmergencyIndicator();
    }
    
    captureCurrentState() {
        return {
            butterchurnActive: this.butterchurnActive,
            videoActive: this.videoActive,
            crossfaderValue: this.crossfaderValue,
            currentPresetIndex: this.currentPresetIndex,
            videoEffects: { ...this.videoEffects },
            currentVideo: this.currentVideo
        };
    }
    
    restoreState(state) {
        this.butterchurnActive = state.butterchurnActive;
        this.videoActive = state.videoActive;
        this.crossfaderValue = state.crossfaderValue;
        this.currentPresetIndex = state.currentPresetIndex;
        this.videoEffects = { ...state.videoEffects };
        this.currentVideo = state.currentVideo;
        
        this.updateAllControls();
    }
    
    updateAllControls() {
        // Update UI to reflect current state
        document.getElementById('butterchurn-enable').classList.toggle('active', this.butterchurnActive);
        document.getElementById('butterchurn-enable').textContent = this.butterchurnActive ? 'ON' : 'OFF';

        document.getElementById('video-enable').classList.toggle('active', this.videoActive);
        document.getElementById('video-enable').textContent = this.videoActive ? 'ON' : 'OFF';

        document.getElementById('main-crossfader').value = this.crossfaderValue;
        this.updateMixRatio();

        // Update preset selector
        if (this.presetKeys.length > 0 && this.currentPresetIndex < this.presetKeys.length) {
            const currentPreset = this.presetKeys[this.currentPresetIndex];
            document.getElementById('butterchurn-presets').value = currentPreset;
            document.getElementById('current-preset').textContent = this.shortenPresetName(currentPreset);
            this.updateFavoriteButton();
        }

        // Update video effects
        document.getElementById('video-speed').value = this.videoEffects.speed;
        document.querySelectorAll('.effect-btn').forEach(btn => {
            const effect = btn.dataset.effect;
            if (this.videoEffects.hasOwnProperty(effect)) {
                btn.classList.toggle('active', this.videoEffects[effect]);
            }
        });

        // Update video slot selection
        if (this.currentVideo !== null) {
            document.querySelectorAll('.video-slot').forEach((slot, i) => {
                slot.classList.toggle('active', i === this.currentVideo);
            });
        }
    }
    
    showEmergencyIndicator(mode) {
        let indicator = document.getElementById('emergency-indicator');
        if (!indicator) {
            indicator = document.createElement('div');
            indicator.id = 'emergency-indicator';
            indicator.style.cssText = `
                position: fixed;
                top: 20px;
                left: 50%;
                transform: translateX(-50%);
                background: rgba(230, 35, 35, 0.9);
                color: white;
                padding: 10px 20px;
                border-radius: 20px;
                font-weight: bold;
                z-index: 1000;
                backdrop-filter: blur(10px);
            `;
            document.body.appendChild(indicator);
        }
        
        indicator.textContent = `🚨 EMERGENCY: ${mode.toUpperCase()}`;
        indicator.style.display = 'block';
    }
    
    hideEmergencyIndicator() {
        const indicator = document.getElementById('emergency-indicator');
        if (indicator) {
            indicator.style.display = 'none';
        }
    }
    
    updateRemoteStatus(connected, message) {
        // Update connection status in UI
        const statusElement = document.querySelector('.audio-status');
        if (statusElement && connected) {
            statusElement.textContent = `🎛️ ${message}`;
        }
    }
    
    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                console.warn('Fullscreen failed:', err);
            });
        } else {
            document.exitFullscreen();
        }
    }

    renderVideo() {
        // Determine source: GIF player from current slot, or video element
        let sourceElement = null;
        let sourceWidth = 0;
        let sourceHeight = 0;
        
        if (this.gifImageLoaded && this.currentVideo !== null) {
            // Use GIF from current slot
            if (this.gifPlayers[this.currentVideo] && this.gifPlayers[this.currentVideo].getCurrentCanvas) {
                // Use GIF player canvas
                sourceElement = this.gifPlayers[this.currentVideo].getCurrentCanvas();
                sourceWidth = sourceElement.width;
                sourceHeight = sourceElement.height;
            } else if (this.gifImageElements[this.currentVideo] && this.gifImageElements[this.currentVideo].complete) {
                // Use native image element
                sourceElement = this.gifImageElements[this.currentVideo];
                sourceWidth = this.gifImageElements[this.currentVideo].naturalWidth;
                sourceHeight = this.gifImageElements[this.currentVideo].naturalHeight;
            }
        } else if (this.videoElement.videoWidth > 0) {
            // Use video element
            sourceElement = this.videoElement;
            sourceWidth = this.videoElement.videoWidth;
            sourceHeight = this.videoElement.videoHeight;
        }
        
        if (!sourceElement || sourceWidth === 0 || sourceHeight === 0) {
            return; // Nothing to render
        }
        
        const sourceAspect = sourceWidth / sourceHeight;
        const canvasAspect = this.canvas.width / this.canvas.height;
        
        let drawWidth, drawHeight, drawX, drawY;
        
        // Calculate dimensions to fit source in canvas while maintaining aspect ratio
        if (sourceAspect > canvasAspect) {
            drawWidth = this.canvas.width;
            drawHeight = this.canvas.width / sourceAspect;
            drawX = 0;
            drawY = (this.canvas.height - drawHeight) / 2;
        } else {
            drawWidth = this.canvas.height * sourceAspect;
            drawHeight = this.canvas.height;
            drawX = (this.canvas.width - drawWidth) / 2;
            drawY = 0;
        }
        
        // Apply video effects
        this.ctx.save();
        
        if (this.videoEffects.flip) {
            this.ctx.scale(-1, 1);
            drawX = -drawX - drawWidth;
        }
        
        this.ctx.drawImage(sourceElement, drawX, drawY, drawWidth, drawHeight);
        
        if (this.videoEffects.invert) {
            this.ctx.globalCompositeOperation = 'difference';
            this.ctx.fillStyle = 'white';
            this.ctx.fillRect(-this.canvas.width, -this.canvas.height, this.canvas.width * 2, this.canvas.height * 2);
            this.ctx.globalCompositeOperation = 'source-over';
        }
        
        this.ctx.restore();
    }
}

// GIF Player class for better GIF support
class SimpleGIFPlayer {
    constructor(gifData) {
        this.frames = gifData.frames;
        this.currentFrame = 0;
        this.isPlaying = false;
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        
        if (this.frames.length > 0) {
            this.canvas.width = this.frames[0].width;
            this.canvas.height = this.frames[0].height;
        }
    }
    
    play() {
        this.isPlaying = true;
        this.animate();
    }
    
    stop() {
        this.isPlaying = false;
    }
    
    animate() {
        if (!this.isPlaying || this.frames.length === 0) return;
        
        const frame = this.frames[this.currentFrame];
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.putImageData(frame.imageData, 0, 0);
        
        this.currentFrame = (this.currentFrame + 1) % this.frames.length;
        
        setTimeout(() => {
            this.animate();
        }, frame.delay || 100);
    }
    
    getCurrentCanvas() {
        return this.canvas;
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Check for required APIs
    if (!window.AudioContext && !window.webkitAudioContext) {
        alert('Your browser does not support Web Audio API. Some features may not work.');
    }
    
    if (typeof butterchurn === 'undefined') {
        console.warn('Butterchurn not found. Music visualization will not be available.');
    }
    
        // Start the mobile hydra application
        window.mobileHydra = new MobileHydra();
        
        // Debug function available in console
        window.debugHydra = () => {
            const hydra = window.mobileHydra;
            console.log('🎵 Hydra Mobile Debug Info:');
            console.log('Butterchurn Active:', hydra.butterchurnActive);
            console.log('Butterchurn Renderer:', !!hydra.butterchurnRenderer);
            console.log('Audio Context:', hydra.audioContext?.state);
            console.log('Audio Source:', !!hydra.audioSource);
            console.log('Video Active:', hydra.videoActive);
            console.log('Crossfader:', hydra.crossfaderValue);
            console.log('Current Preset:', hydra.presetKeys[hydra.currentPresetIndex]);
            console.log('Total Presets:', hydra.presetKeys.length);
            console.log('Favorites:', hydra.favoritePresets.length);
        };
    
    console.log('🎵 Hydra Mobile initialized successfully!');
});

// Prevent page refresh on mobile pull-down
document.addEventListener('touchstart', handleTouchStart, { passive: false });
document.addEventListener('touchmove', handleTouchMove, { passive: false });

let yDown = null;

function getTouches(evt) {
    return evt.touches || evt.originalEvent.touches;
}

function handleTouchStart(evt) {
    const firstTouch = getTouches(evt)[0];
    yDown = firstTouch.clientY;
}

function handleTouchMove(evt) {
    if (!yDown) {
        return;
    }
    
    let yUp = evt.touches[0].clientY;
    let yDiff = yDown - yUp;
    
    if (yDiff > 0) {
        // Swiping up
    } else {
        // Swiping down
        if (window.scrollY === 0) {
            evt.preventDefault();
        }
    }
    
    yDown = null;
}

// Service Worker registration for PWA capabilities (optional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // Register service worker if available
        // This would enable offline capabilities
    });
}

// Export for debugging
window.MobileHydra = MobileHydra;