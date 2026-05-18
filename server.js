const WebSocket = require('ws');
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 8080;

// Create HTTP server for serving files
const server = http.createServer((req, res) => {
    // WebSocket path - this endpoint only supports WebSocket connections
    // The ws library handles WebSocket upgrades automatically via the 'upgrade' event
    // We just need to handle regular HTTP GET requests gracefully
    const url = req.url.split('?')[0]; // Remove query params for routing
    if (url === '/remote-control') {
        // Return helpful message for HTTP GET requests to WebSocket endpoint
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('WebSocket endpoint. Connect using ws:// or wss:// protocol.\n');
        return;
    }
    
    // Use url without query params for file serving
    let filePath = '.' + url;
    if (filePath === './') {
        filePath = './index.html';
    }

    const extname = String(path.extname(filePath)).toLowerCase();
    const mimeTypes = {
        '.html': 'text/html',
        '.js': 'text/javascript',
        '.css': 'text/css',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpg',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml',
        '.wav': 'audio/wav',
        '.mp4': 'video/mp4',
        '.woff': 'application/font-woff',
        '.ttf': 'application/font-ttf',
        '.eot': 'application/vnd.ms-fontobject',
        '.otf': 'application/font-otf',
        '.wasm': 'application/wasm'
    };

    const contentType = mimeTypes[extname] || 'application/octet-stream';

    fs.readFile(filePath, (error, content) => {
        if (error) {
            if (error.code === 'ENOENT') {
                res.writeHead(404, { 'Content-Type': 'text/html' });
                res.end('404 Not Found', 'utf-8');
            } else {
                res.writeHead(500);
                res.end('Sorry, check with the site admin for error: ' + error.code + ' ..\n');
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});

// ============================================================================
// Remote Control WebSocket Server (for mobile display + control panel)
// ============================================================================

const controlWss = new WebSocket.Server({ 
    server: server,
    path: '/remote-control'
});

// Add error handling for controlWss
controlWss.on('error', (error) => {
    console.error('❌ controlWss server error:', error);
});

console.log('🔧 controlWss created with path: /remote-control');

// Control server state management
const controlClients = new Map();
let displayClients = new Set(); // Mobile displays
let controlPanelClients = new Set(); // Control panels

const MessageTypes = {
    CROSSFADER: 'crossfader',
    EMERGENCY: 'emergency',
    BEAT_SYNC: 'beat_sync',
    PRESET: 'preset',
    VIDEO: 'video',
    EFFECT: 'effect',
    SCENE: 'scene',
    CONFIG: 'config',
    FILE_UPLOAD: 'file_upload',
    REGISTER: 'register',
    HEARTBEAT: 'heartbeat',
    STATUS: 'status'
};

controlWss.on('connection', (ws, req) => {
    const clientId = Math.random().toString(36).substr(2, 9);
    const clientInfo = {
        id: clientId,
        ws: ws,
        type: null,
        lastHeartbeat: Date.now(),
        ip: req.socket.remoteAddress
    };
    
    controlClients.set(clientId, clientInfo);
    console.log(`📱 Control client connected: ${clientId} from ${clientInfo.ip}`);
    console.log(`📊 Control counts - Total: ${controlClients.size}, Displays: ${displayClients.size}, Controls: ${controlPanelClients.size}`);
    
    // Send welcome message
    ws.send(JSON.stringify({
        type: MessageTypes.STATUS,
        status: 'connected',
        clientId: clientId,
        timestamp: Date.now(),
        serverInfo: {
            connectedClients: controlClients.size,
            displayClients: displayClients.size,
            controlClients: controlPanelClients.size
        }
    }));
    
    // Message handler
    ws.on('message', (data) => {
        try {
            const message = JSON.parse(data);
            handleControlMessage(clientId, message);
        } catch (error) {
            console.error(`❌ Invalid control message from ${clientId}:`, error);
        }
    });
    
    // Close handler
    ws.on('close', () => {
        const client = controlClients.get(clientId);
        if (client) {
            if (client.type === 'display') {
                displayClients.delete(clientId);
            } else if (client.type === 'control') {
                controlPanelClients.delete(clientId);
            }
            controlClients.delete(clientId);
            console.log(`📱 Control client disconnected: ${clientId} (${client.type || 'unknown'})`);
            
            // Notify other clients
            broadcastToControlPanels({
                type: MessageTypes.STATUS,
                action: 'client_disconnected',
                clientId: clientId,
                connectedClients: controlClients.size,
                displayClients: displayClients.size,
                controlClients: controlPanelClients.size
            });
        }
    });
    
    ws.on('error', (error) => {
        console.error(`❌ Control WebSocket error for ${clientId}:`, error);
    });
});

function handleControlMessage(clientId, message) {
    const client = controlClients.get(clientId);
    if (!client) return;
    
    if (!message.timestamp) {
        message.timestamp = Date.now();
    }
    
    // Only log non-heartbeat messages to reduce console noise
    if (message.type !== MessageTypes.HEARTBEAT) {
        console.log(`📨 Control ${clientId} (${client.type || 'unknown'}): ${message.type}`);
    }
    
    switch (message.type) {
        case MessageTypes.REGISTER:
            client.type = message.clientType;
            client.name = message.clientName || `Client ${clientId}`;
            
            if (message.clientType === 'display') {
                displayClients.add(clientId);
                console.log(`📺 Display registered: ${client.name}`);
                // Send initial state to new display
                client.ws.send(JSON.stringify({
                    type: MessageTypes.CONFIG,
                    action: 'initial_state',
                    timestamp: Date.now()
                }));
            } else if (message.clientType === 'control') {
                controlPanelClients.add(clientId);
                console.log(`🎛️ Control panel registered: ${client.name}`);
            }
            
            // Broadcast registration update to all control panels
            broadcastToControlPanels({
                type: MessageTypes.STATUS,
                action: 'client_registered',
                clientId: clientId,
                clientType: client.type,
                clientName: client.name,
                connectedClients: controlClients.size,
                displayClients: displayClients.size,
                controlClients: controlPanelClients.size
            });
            break;
            
        case MessageTypes.HEARTBEAT:
            client.lastHeartbeat = Date.now();
            client.ws.send(JSON.stringify({
                type: MessageTypes.HEARTBEAT,
                timestamp: Date.now()
            }));
            break;
            
         case MessageTypes.CROSSFADER:
         case MessageTypes.PRESET:
         case MessageTypes.EFFECT:
         case MessageTypes.EMERGENCY:
         case MessageTypes.SCENE:
         case 'mic_sensitivity':
         case 'blend_mode':
             // Forward control messages to displays
             broadcastToDisplays(message);
             break;
             
         case MessageTypes.VIDEO:
             // Handle video messages
             if (message.action === 'load_url') {
                 // Extract filename or use URL as name
                 const urlParts = message.url.split('/');
                 const filename = urlParts[urlParts.length - 1].split(/[?#]/)[0] || 'video';
                 
                 // Send preview update back to control panel
                 client.ws.send(JSON.stringify({
                     type: 'video_slot_update',
                     slot: message.slot || 0,
                     url: message.url,
                     name: filename,
                     timestamp: Date.now()
                 }));
             }
             // Forward video messages to displays
             broadcastToDisplays(message);
             break;
            
         case 'request_video_slots':
             // Display is requesting current video slots, forward to control panels
             broadcastToControlPanels(message);
             break;
             
         case MessageTypes.FILE_UPLOAD:
             // Forward file upload messages to displays
             broadcastToDisplays(message);
             break;
             
         case 'video_slot_update':
             // Display sending slot update, forward to control panels
             broadcastToControlPanels(message);
             break;
             
         case MessageTypes.STATUS:
         case 'preset_list':
             // Forward status updates to control panels
             broadcastToControlPanels(message);
             break;
             
         default:
             console.warn(`⚠️ Unknown control message type: ${message.type}`);
     }
}

function broadcastToDisplays(message) {
    const data = JSON.stringify(message);
    displayClients.forEach(clientId => {
        const client = controlClients.get(clientId);
        if (client && client.ws.readyState === WebSocket.OPEN) {
            client.ws.send(data);
        }
    });
}

function broadcastToControlPanels(message) {
    const data = JSON.stringify(message);
    controlPanelClients.forEach(clientId => {
        const client = controlClients.get(clientId);
        if (client && client.ws.readyState === WebSocket.OPEN) {
            client.ws.send(data);
        }
    });
}

// Heartbeat for control clients
setInterval(() => {
    const now = Date.now();
    const timeoutThreshold = 60000; // 60 seconds
    
    controlClients.forEach((client, clientId) => {
        if (now - client.lastHeartbeat > timeoutThreshold) {
            console.log(`💔 Control client ${clientId} timed out`);
            client.ws.terminate();
            controlClients.delete(clientId);
            displayClients.delete(clientId);
            controlPanelClients.delete(clientId);
        } else if (client.ws.readyState === WebSocket.OPEN) {
            try {
                client.ws.send(JSON.stringify({
                    type: MessageTypes.HEARTBEAT,
                    timestamp: now
                }));
            } catch (error) {
                console.error(`❌ Failed to send heartbeat to ${clientId}:`, error);
            }
        }
    });
}, 30000); // Every 30 seconds

// Log all upgrade attempts for debugging
server.on('upgrade', (request, socket, head) => {
    console.log('🔄 Upgrade request to:', request.url);
});

server.listen(PORT, '0.0.0.0', () => {
    console.log(`HTTP Server running at http://0.0.0.0:${PORT}/`);
    console.log(`WebSocket Remote Control at ws://0.0.0.0:${PORT}/remote-control`);
    console.log('');
    
    if (process.env.NODE_ENV === 'production') {
        console.log('🎵 Hydra VJ Mixer - Production Mode');
        console.log('==================================');
        console.log('Main interface: http://localhost:' + PORT);
        console.log('Mobile display: http://localhost:' + PORT + '/mobile.html');
        console.log('Control panel: http://localhost:' + PORT + '/control.html');
        console.log('WebSocket remote control: ws://localhost:' + PORT + '/remote-control');
    } else {
        console.log('To access from other devices on your network:');
        console.log('1. Find your local IP address (usually 192.168.x.x or 10.x.x.x)');
        console.log('2. Open http://YOUR_IP:' + PORT + '/ on other devices');
        console.log('3. Mobile display: http://YOUR_IP:' + PORT + '/mobile.html');
        console.log('4. Control panel: http://YOUR_IP:' + PORT + '/control.html');
        console.log('5. WebSocket remote control: ws://YOUR_IP:' + PORT + '/remote-control');
    }
});

console.log('Hydra Network Streaming Server');
console.log('==============================');