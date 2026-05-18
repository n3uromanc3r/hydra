/**
 * Hydra Live Control Panel
 * Real-time VJ control interface
 */

class HydraController {
    constructor() {
        this.ws = null;
        this.isConnected = false;
        this.clientId = null;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 2000;
        
        // Performance state
        this.state = {
            butterchurn: {
                enabled: true,
                currentPreset: null,
                presetIndex: 0,
                totalPresets: 0,
                autoMode: false,
                audioEnabled: false,
                availablePresets: []
            },
            video: {
                enabled: false,
                currentSlot: null,
                slots: [null, null, null, null, null, null], // Track loaded video slots
                effects: {
                    invert: false,
                    flip: false,
                    reverse: false,
                    speed: 1
                }
            },
            master: {
                crossfader: 50,
                blackout: false,
                mode: 'mix' // 'mix', 'audio-only', 'video-only', 'blackout'
            },
            bpm: {
                value: 120,
                syncEnabled: false,
                lastTap: 0,
                taps: []
            },
            audio: {
                micSensitivity: 1.0
            },
            scenes: {}
        };
        
        this.init();
    }
    
    init() {
        this.setupUI();
        this.connect();
        this.setupKeyboardShortcuts();
    }
    
    // WebSocket Connection
    connect() {
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
        
        console.log('🔗 Attempting to connect to WebSocket server...');
        console.log('🔗 URL:', wsUrl);
        console.log('🔗 Protocol:', protocol);
        console.log('🔗 Host:', wsHost);
        console.log('🔗 Page loaded from:', window.location.host);
        
        try {
            this.ws = new WebSocket(wsUrl);
            console.log('🔗 WebSocket object created');
            this.setupWebSocketHandlers();
        } catch (error) {
            console.error('❌ Connection failed:', error);
            this.updateConnectionStatus(false, 'Connection failed');
            this.scheduleReconnect();
        }
    }
    
    setupWebSocketHandlers() {
        this.ws.onopen = () => {
            console.log('✅ Connected to Hydra server');
            this.isConnected = true;
            this.reconnectAttempts = 0;
            this.updateConnectionStatus(true, 'Connected');
            
            // Register as control panel
            this.send({
                type: 'register',
                clientType: 'control',
                clientName: `Control Panel ${new Date().toLocaleTimeString()}`
            });
            
            console.log('🎛️ Registered as control panel');
        };
        
        this.ws.onmessage = (event) => {
            try {
                const message = JSON.parse(event.data);
                this.handleMessage(message);
            } catch (error) {
                console.error('❌ Invalid message:', error);
            }
        };
        
        this.ws.onclose = () => {
            console.log('🔌 Disconnected from server');
            this.isConnected = false;
            this.updateConnectionStatus(false, 'Disconnected');
            this.scheduleReconnect();
        };
        
        this.ws.onerror = (error) => {
            console.error('❌ WebSocket error:', error);
            this.showStatus('Connection error', 'error');
        };
    }
    
    scheduleReconnect() {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            const delay = this.reconnectDelay * this.reconnectAttempts;
            
            this.updateConnectionStatus(false, `Reconnecting in ${delay/1000}s...`);
            
            setTimeout(() => {
                console.log(`🔄 Reconnect attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
                this.connect();
            }, delay);
        } else {
            this.updateConnectionStatus(false, 'Connection failed - please refresh');
            this.showStatus('Unable to connect to server', 'error');
        }
    }
    
    send(message) {
        if (this.isConnected && this.ws.readyState === WebSocket.OPEN) {
            message.timestamp = Date.now();
            this.ws.send(JSON.stringify(message));
            return true;
        } else {
            console.warn('⚠️ Cannot send message - not connected');
            return false;
        }
    }
    
    handleMessage(message) {
        // Don't log heartbeat messages to reduce console noise
        if (message.type !== 'heartbeat') {
            console.log('📨 Received:', message.type, message);
        }
        
        switch (message.type) {
            case 'status':
                this.handleStatusUpdate(message);
                break;

            case 'preset_list':
                console.log('📨 Received preset_list:', message.presets.length, 'presets');
                this.state.butterchurn.availablePresets = message.presets;
                this.state.butterchurn.totalPresets = message.presets.length;
                this.populatePresetSelector();
                this.updatePresetDisplay();
                break;
            
            case 'video_slot_update':
                console.log('📨 Received video_slot_update:', message);
                // Store slot data for reconnection sync
                if (message.slot >= 0 && message.slot < this.state.video.slots.length) {
                    this.state.video.slots[message.slot] = {
                        url: message.url,
                        name: message.name,
                        isGif: message.isGif
                    };
                }
                this.updateVideoSlotPreview(message.slot, message.url, message.name);
                break;
                
            case 'request_video_slots':
                console.log('📨 Display requesting video slots, re-sending', this.state.video.slots.filter(s => s).length, 'slots');
                this.resendVideoSlots();
                break;
                
            case 'heartbeat':
                // Respond to heartbeat
                this.send({ type: 'heartbeat' });
                break;
                
            default:
                console.log('📨 Unhandled message:', message);
        }
    }
    
    handleStatusUpdate(message) {
        console.log('📊 Status update received:', message);
        
        if (message.action === 'client_registered' || message.action === 'client_disconnected') {
            console.log('Client count update:', {
                displays: message.displayClients,
                controls: message.controlClients
            });
            this.updateClientCounts(message);
            
            // If a new display connected, re-send all video slots
            if (message.action === 'client_registered' && message.clientType === 'display') {
                console.log('📺 New display connected, syncing video slots');
                setTimeout(() => this.resendVideoSlots(), 500);
            }
        }
        
        // Also check for serverInfo in case it's nested
        if (message.serverInfo) {
            this.updateClientCounts(message.serverInfo);
        }
    }
    
    resendVideoSlots() {
        const loadedSlots = this.state.video.slots.filter(s => s);
        console.log('📤 Re-sending', loadedSlots.length, 'video slots to display');
        
        this.state.video.slots.forEach((slotData, index) => {
            if (slotData) {
                this.send({
                    type: 'video',
                    action: 'load_url',
                    url: slotData.url,
                    slot: index
                });
            }
        });
    }
    
    updateClientCounts(info) {
        console.log('Updating client counts:', info);
        if (info.displayClients !== undefined) {
            const displayElement = document.getElementById('connected-displays');
            console.log('Display element found:', !!displayElement);
            if (displayElement) {
                displayElement.textContent = `📺 Displays: ${info.displayClients}`;
                console.log('Updated display count to:', info.displayClients);
            }
        }
        if (info.controlClients !== undefined) {
            const controlElement = document.getElementById('connected-controls');
            console.log('Control element found:', !!controlElement);
            if (controlElement) {
                controlElement.textContent = `🎛️ Controls: ${info.controlClients}`;
                console.log('Updated control count to:', info.controlClients);
            }
        }
    }
    
    updateConnectionStatus(connected, text) {
        const indicator = document.getElementById('status-indicator');
        const statusText = document.getElementById('status-text');
        
        indicator.className = connected ? 'connected' : 'disconnected';
        indicator.textContent = connected ? '🟢' : '🔴';
        statusText.textContent = text;
    }
    
    // UI Setup
    setupUI() {
        this.setupControlHandlers();
        this.setupModalHandlers();
        this.updateUI();
    }
    
    setupControlHandlers() {
        // Emergency stop
        document.getElementById('emergency-stop').addEventListener('click', () => {
            this.emergencyStop();
        });
        
        // Butterchurn controls
        document.getElementById('butterchurn-enable').addEventListener('change', (e) => {
            this.toggleButterchurn(e.target.checked);
        });
        
        document.getElementById('preset-prev').addEventListener('click', () => {
            this.changePreset('prev');
        });
        
        document.getElementById('preset-next').addEventListener('click', () => {
            this.changePreset('next');
        });
        
        document.getElementById('preset-random').addEventListener('click', () => {
            this.changePreset('random');
        });
        
        document.getElementById('preset-auto').addEventListener('click', () => {
            this.toggleAutoMode();
        });
        
        document.getElementById('preset-favorite').addEventListener('click', () => {
            this.toggleFavorite();
        });

        document.getElementById('preset-select').addEventListener('change', (e) => {
            this.loadPresetByName(e.target.value);
        });
        
        // Master controls
        document.getElementById('master-crossfader').addEventListener('input', (e) => {
            this.setCrossfader(parseInt(e.target.value));
        });
        
        // Blend mode
        document.getElementById('blend-mode').addEventListener('change', (e) => {
            this.setBlendMode(e.target.value);
        });
        
        // Quick actions
        document.getElementById('action-blackout').addEventListener('click', () => {
            this.setMode('blackout');
        });
        
        document.getElementById('action-audio-only').addEventListener('click', () => {
            this.setMode('audio-only');
        });
        
        document.getElementById('action-video-only').addEventListener('click', () => {
            this.setMode('video-only');
        });
        
        document.getElementById('action-fullscreen').addEventListener('click', () => {
            this.toggleFullscreen();
        });
        
        // BPM controls
        document.getElementById('bpm-tap').addEventListener('click', () => {
            this.tapBPM();
        });
        
        document.getElementById('bpm-sync-enable').addEventListener('change', (e) => {
            this.toggleBPMSync(e.target.checked);
        });

        // Microphone sensitivity control
        document.getElementById('mic-sensitivity-slider').addEventListener('input', (e) => {
            this.setMicrophoneSensitivity(parseFloat(e.target.value));
        });
        
        // Video controls
        document.getElementById('video-enable').addEventListener('change', (e) => {
            this.toggleVideo(e.target.checked);
        });
        
        document.getElementById('video-speed').addEventListener('input', (e) => {
            this.setVideoSpeed(parseFloat(e.target.value));
        });
        
        // Video effects
        document.getElementById('effect-invert').addEventListener('click', () => {
            this.toggleVideoEffect('invert');
        });
        
        document.getElementById('effect-flip').addEventListener('click', () => {
            this.toggleVideoEffect('flip');
        });
        
        document.getElementById('effect-reverse').addEventListener('click', () => {
            this.toggleVideoEffect('reverse');
        });
        
        document.getElementById('effect-speed').addEventListener('click', () => {
            this.toggleVideoEffect('speed');
        });
        
        // Video upload
        document.getElementById('upload-file').addEventListener('click', () => {
            document.getElementById('video-file').click();
        });
        
        document.getElementById('video-file').addEventListener('change', (e) => {
            this.uploadVideoFile(e.target.files[0]);
        });
        
        document.getElementById('load-url').addEventListener('click', () => {
            const url = document.getElementById('video-url').value.trim();
            if (url) {
                this.loadVideoURL(url);
            }
        });
        
         // Video slots
         document.querySelectorAll('.video-slot').forEach(slot => {
             const slotNum = parseInt(slot.dataset.slot);
             
             // Click anywhere on the slot to select it
             slot.addEventListener('click', () => {
                 this.selectVideoSlot(slotNum);
             });
         });
    }

    loadPresetByName(presetName) {
        console.log('📤 Sending load_by_name preset command:', presetName);
        this.send({
            type: 'preset',
            action: 'load_by_name',
            presetName: presetName.trim()
        });
    }

    populatePresetSelector() {
        const selector = document.getElementById('preset-select');
        selector.innerHTML = ''; // Clear existing options

        if (this.state.butterchurn.availablePresets.length === 0) {
            const option = document.createElement('option');
            option.value = '';
            option.textContent = 'No presets available';
            selector.appendChild(option);
            return;
        }

        this.state.butterchurn.availablePresets.forEach(presetName => {
            const option = document.createElement('option');
            option.value = presetName;
            option.textContent = presetName;
            selector.appendChild(option);
        });

        // Set the currently active preset if available
        if (this.state.butterchurn.currentPreset) {
            selector.value = this.state.butterchurn.currentPreset;
        }
    }
    
    setupModalHandlers() {
        const modal = document.getElementById('connection-modal');
        const closeBtn = document.getElementById('close-connection-modal');
        
        // Show connection modal if no displays connected
        setTimeout(() => {
            if (!this.hasDisplayClients()) {
                modal.style.display = 'block';
                this.generateConnectionInfo();
            }
        }, 3000);
        
        closeBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });
        
        document.getElementById('copy-url').addEventListener('click', () => {
            const url = document.getElementById('mobile-url').textContent;
            navigator.clipboard.writeText(url).then(() => {
                this.showStatus('URL copied to clipboard', 'success');
            });
        });
    }
    
    generateConnectionInfo() {
        const host = window.location.hostname;
        const port = window.location.port || '8080';
        const mobileUrl = `http://${host}:${port}/mobile.html`;
        
        document.getElementById('mobile-url').textContent = mobileUrl;
        
        // TODO: Generate actual QR code
        document.getElementById('qr-placeholder').textContent = 'QR Code\\nfor mobile connection';
    }
    
    // Control Functions
    emergencyStop() {
        this.setMode('blackout');
        this.showStatus('EMERGENCY STOP ACTIVATED', 'error');
        
        this.send({
            type: 'emergency',
            action: 'stop',
            immediate: true
        });
    }
    
    toggleButterchurn(enabled) {
        this.state.butterchurn.enabled = enabled;
        this.updateUI();
        
        this.send({
            type: 'preset',
            action: 'toggle',
            enabled: enabled
        });
    }
    
    changePreset(action) {
        const currentIndex = this.state.butterchurn.presetIndex;
        let newIndex = currentIndex;
        
        switch (action) {
            case 'prev':
                newIndex = Math.max(0, currentIndex - 1);
                break;
            case 'next':
                newIndex = Math.min(this.state.butterchurn.totalPresets - 1, currentIndex + 1);
                break;
            case 'random':
                newIndex = Math.floor(Math.random() * this.state.butterchurn.totalPresets);
                break;
        }
        
        this.state.butterchurn.presetIndex = newIndex;
        this.updateUI();
        
        this.send({
            type: 'preset',
            action: action,
            index: newIndex
        });
    }
    
    toggleAutoMode() {
        this.state.butterchurn.autoMode = !this.state.butterchurn.autoMode;
        this.updateUI();
        
        this.send({
            type: 'preset',
            action: 'auto',
            enabled: this.state.butterchurn.autoMode
        });
    }
    
    toggleFavorite() {
        this.send({
            type: 'preset',
            action: 'favorite'
        });
    }
    
    setCrossfader(value) {
        this.state.master.crossfader = value;
        this.updateUI();
        
        this.send({
            type: 'crossfader',
            value: value
        });
    }
    
    setBlendMode(mode) {
        console.log('🎨 Setting blend mode:', mode);
        this.send({
            type: 'blend_mode',
            mode: mode
        });
    }
    
    setMode(mode) {
        this.state.master.mode = mode;
        this.updateQuickActions();
        
        switch (mode) {
            case 'blackout':
                this.state.master.crossfader = 0;
                break;
            case 'audio-only':
                this.state.master.crossfader = 0;
                break;
            case 'video-only':
                this.state.master.crossfader = 100;
                break;
            case 'mix':
                this.state.master.crossfader = 50;
                break;
        }
        
        document.getElementById('master-crossfader').value = this.state.master.crossfader;
        this.updateUI();
        
        this.send({
            type: 'emergency',
            action: mode
        });
    }
    
    tapBPM() {
        const now = Date.now();
        this.state.bpm.taps.push(now);
        
        // Keep only last 8 taps
        if (this.state.bpm.taps.length > 8) {
            this.state.bpm.taps.shift();
        }
        
        if (this.state.bpm.taps.length >= 2) {
            const intervals = [];
            for (let i = 1; i < this.state.bpm.taps.length; i++) {
                intervals.push(this.state.bpm.taps[i] - this.state.bpm.taps[i - 1]);
            }
            
            const avgInterval = intervals.reduce((a, b) => a + b) / intervals.length;
            const bpm = Math.round(60000 / avgInterval);
            
            if (bpm >= 60 && bpm <= 200) {
                this.state.bpm.value = bpm;
                this.updateUI();
                
                this.send({
                    type: 'beat_sync',
                    bpm: bpm,
                    timestamp: now
                });
            }
        }
        
        // Reset taps after 3 seconds of inactivity
        setTimeout(() => {
            const lastTap = this.state.bpm.taps[this.state.bpm.taps.length - 1];
            if (Date.now() - lastTap > 3000) {
                this.state.bpm.taps = [];
            }
        }, 3000);
    }
    
    toggleBPMSync(enabled) {
        this.state.bpm.syncEnabled = enabled;
        
        this.send({
            type: 'beat_sync',
            action: 'toggle',
            enabled: enabled
        });
    }
    
    toggleVideo(enabled) {
        this.state.video.enabled = enabled;
        this.updateUI();
        
        this.send({
            type: 'video',
            action: 'toggle',
            enabled: enabled
        });
    }
    
    toggleVideoEffect(effect) {
        if (effect === 'speed') {
            // Toggle between 1x and 2x speed
            this.state.video.effects.speed = this.state.video.effects.speed === 1 ? 2 : 1;
        } else {
            this.state.video.effects[effect] = !this.state.video.effects[effect];
        }
        
        this.updateUI();
        
        this.send({
            type: 'effect',
            effect: effect,
            enabled: this.state.video.effects[effect],
            value: this.state.video.effects[effect]
        });
    }
    
    setVideoSpeed(speed) {
        this.state.video.effects.speed = speed;
        this.updateUI();
        
        this.send({
            type: 'effect',
            effect: 'speed',
            value: speed
        });
    }
    
    selectVideoSlot(slot) {
        console.log('🎬 Control: Selecting video slot', slot);
        this.state.video.currentSlot = slot;
        this.updateVideoSlots();
        
        const message = {
            type: 'video',
            action: 'select_slot',
            slot: slot
        };
        console.log('📤 Sending message:', message);
        this.send(message);
    }
    
     updateVideoSlotPreview(slotIndex, url, name) {
         console.log('🖼️ Updating preview for slot', slotIndex, ':', { url, name });
         const slots = document.querySelectorAll('.video-slot');
         const slot = slots[slotIndex];
         
         if (!slot) {
             console.warn('⚠️ Slot not found:', slotIndex);
             return;
         }
         
         const preview = slot.querySelector('.slot-preview');
         const label = slot.querySelector('.slot-label');
         
         if (preview) {
             // Set the GIF/video URL as image src (allows animation)
             preview.src = url;
             preview.alt = name;
         }
         
         if (label) {
             const shortName = name.length > 10 ? name.substring(0, 10) + '...' : name;
             label.textContent = shortName;
         }
         
         // Mark slot as loaded
         slot.classList.add('loaded');
     }
    
    uploadVideoFile(file) {
        if (!file) return;
        
        const slot = this.state.video.currentSlot !== null ? this.state.video.currentSlot : 0;
        this.showStatus(`Uploading ${file.name} to slot ${slot + 1}...`, 'info');
        
        console.log('Uploading file:', file.name, 'to slot:', slot);
        
        this.send({
            type: 'file_upload',
            action: 'video',
            filename: file.name,
            size: file.size,
            type: file.type,
            slot: slot
        });
    }
    
     loadVideoURL(url) {
         const slot = this.state.video.currentSlot !== null ? this.state.video.currentSlot : 0;
         this.showStatus(`Loading video to slot ${slot + 1}...`, 'info');
         document.getElementById('video-url').value = '';
         
         console.log('📤 loadVideoURL: slot=', slot, 'currentSlot=', this.state.video.currentSlot);
         
         this.send({
             type: 'video',
             action: 'load_url',
             url: url,
             slot: slot
         });
     }
    
    saveScene(sceneNum) {
        this.state.scenes[sceneNum] = JSON.parse(JSON.stringify(this.state));
        this.showStatus(`Scene ${sceneNum} saved`, 'success');
        this.updateScenes();
        
        this.send({
            type: 'scene',
            action: 'save',
            scene: sceneNum,
            state: this.state.scenes[sceneNum]
        });
    }
    
    loadScene(sceneNum) {
        if (this.state.scenes[sceneNum]) {
            // Restore state (except scenes)
            const scenesBackup = this.state.scenes;
            this.state = JSON.parse(JSON.stringify(this.state.scenes[sceneNum]));
            this.state.scenes = scenesBackup;
            
            this.updateUI();
            this.showStatus(`Scene ${sceneNum} loaded`, 'success');
            
            this.send({
                type: 'scene',
                action: 'load',
                scene: sceneNum,
                state: this.state
            });
        }
    }

    setMicrophoneSensitivity(value) {
        this.state.audio.micSensitivity = value;
        this.updateUI();

        this.send({
            type: 'mic_sensitivity',
            value: value
        });
    }
    
    toggleFullscreen() {
        this.send({
            type: 'config',
            action: 'fullscreen'
        });
    }
    
    // UI Updates
    updateUI() {
        this.updateCrossfader();
        this.updatePresetDisplay();
        this.updateVideoControls();
        this.updateBPMDisplay();
        this.updateQuickActions();
        this.updateAudioControls();
    }

    updateCrossfader() {
        document.getElementById('crossfader-display').textContent = `${this.state.master.crossfader}%`;
    }

    updateAudioControls() {
        document.getElementById('mic-sensitivity-slider').value = this.state.audio.micSensitivity;
        document.getElementById('mic-sensitivity-display').textContent = `${(this.state.audio.micSensitivity * 100).toFixed(0)}%`;
    }
    
    updatePresetDisplay() {
        document.getElementById('current-preset').textContent = 
            this.state.butterchurn.currentPreset || 'No preset selected';
        document.getElementById('preset-index').textContent =
            `${this.state.butterchurn.presetIndex + 1}/${this.state.butterchurn.totalPresets}`;

        // Update preset selector
        const selector = document.getElementById('preset-select');
        if (selector && this.state.butterchurn.currentPreset) {
            selector.value = this.state.butterchurn.currentPreset;
        }
        
        // Update button states
        document.getElementById('preset-auto').classList.toggle('active', this.state.butterchurn.autoMode);
        document.getElementById('butterchurn-enable').checked = this.state.butterchurn.enabled;
    }
    
    updateVideoControls() {
        document.getElementById('video-enable').checked = this.state.video.enabled;
        document.getElementById('video-speed').value = this.state.video.effects.speed;
        document.getElementById('speed-display').textContent = `${this.state.video.effects.speed}x`;
        
        // Update effect buttons
        Object.keys(this.state.video.effects).forEach(effect => {
            const btn = document.getElementById(`effect-${effect}`);
            if (btn) {
                btn.classList.toggle('active', this.state.video.effects[effect] !== false && this.state.video.effects[effect] !== 1);
            }
        });
        
        this.updateVideoSlots();
    }
    
     updateVideoSlots() {
         document.querySelectorAll('.video-slot').forEach((slot, index) => {
             slot.classList.toggle('active', this.state.video.currentSlot === index);
         });
     }
    
    updateBPMDisplay() {
        document.getElementById('bpm-counter').textContent = this.state.bpm.value;
        document.getElementById('bpm-sync-enable').checked = this.state.bpm.syncEnabled;
    }
    
    updateQuickActions() {
        document.querySelectorAll('.quick-btn').forEach(btn => btn.classList.remove('active'));
        
        const activeBtn = document.getElementById(`action-${this.state.master.mode}`);
        if (activeBtn) {
            activeBtn.classList.add('active');
        }
    }
    
    updateScenes() {
        document.querySelectorAll('.scene-slot').forEach((slot, index) => {
            const sceneNum = index + 1;
            const hasScene = this.state.scenes[sceneNum];
            slot.classList.toggle('active', hasScene);
        });
    }
    
    // Utilities
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            if (e.target.tagName.toLowerCase() === 'input') return;
            
            switch (e.key) {
                case ' ':
                    e.preventDefault();
                    this.emergencyStop();
                    break;
                case 'ArrowLeft':
                    e.preventDefault();
                    this.changePreset('prev');
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    this.changePreset('next');
                    break;
                case 'r':
                    e.preventDefault();
                    this.changePreset('random');
                    break;
                case 'a':
                    e.preventDefault();
                    this.toggleAutoMode();
                    break;
                case '1':
                case '2':
                case '3':
                case '4':
                case '5':
                case '6':
                case '7':
                case '8':
                    e.preventDefault();
                    const sceneNum = parseInt(e.key);
                    if (e.shiftKey) {
                        this.saveScene(sceneNum);
                    } else {
                        this.loadScene(sceneNum);
                    }
                    break;
                case 't':
                    e.preventDefault();
                    this.tapBPM();
                    break;
            }
        });
    }
    
    hasDisplayClients() {
        const displayText = document.getElementById('connected-displays').textContent;
        const match = displayText.match(/\d+/);
        return match ? parseInt(match[0]) > 0 : false;
    }
    
    showStatus(message, type = 'info', duration = 3000) {
        const container = document.getElementById('status-messages');
        const messageEl = document.createElement('div');
        messageEl.className = `status-message ${type}`;
        messageEl.textContent = message;
        
        container.appendChild(messageEl);
        
        // Animate in
        setTimeout(() => {
            messageEl.classList.add('show');
        }, 10);
        
        // Remove after duration
        setTimeout(() => {
            messageEl.classList.remove('show');
            setTimeout(() => {
                if (messageEl.parentNode) {
                    messageEl.parentNode.removeChild(messageEl);
                }
            }, 300);
        }, duration);
    }
}

// Initialize controller when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.hydraController = new HydraController();
    console.log('🎛️ Hydra Live Control Panel initialized');
});

// Debug functions
window.debugController = () => {
    const controller = window.hydraController;
    console.log('🎛️ Controller State:', controller.state);
    console.log('🔗 Connection:', controller.isConnected);
    console.log('📱 Client ID:', controller.clientId);
};