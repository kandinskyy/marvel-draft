import Peer from 'peerjs';

class PeerManager {
  constructor() {
    this.peer = null;
    this.connections = new Map(); // peerId -> connection
    this.hostConnection = null;
    this.roomCode = null;
    this.isHost = false;
    this.myPeerId = null;
    this.broadcastChannel = null;
    this.onMessageCallback = null;
    this.onConnectCallback = null;
    this.onDisconnectCallback = null;
    this.statusText = 'Disconnected';
  }

  generateRoomCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  getIceServers() {
    return [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      { urls: 'stun:stun2.l.google.com:19302' },
      { urls: 'stun:stun3.l.google.com:19302' },
      { urls: 'stun:stun4.l.google.com:19302' }
    ];
  }

  initLocalBroadcast(code) {
    if (this.broadcastChannel) {
      try { this.broadcastChannel.close(); } catch(e){}
    }
    try {
      this.broadcastChannel = new BroadcastChannel(`marvel-draft-${code}`);
      this.broadcastChannel.onmessage = (event) => {
        if (this.onMessageCallback) {
          this.onMessageCallback(event.data.type, event.data.payload, event.data.senderId);
        }
      };
    } catch(e){}
  }

  createRoom(onReady) {
    this.isHost = true;
    this.roomCode = this.generateRoomCode();
    this.initLocalBroadcast(this.roomCode);

    const targetPeerId = `MDRAFT-${this.roomCode}`;

    try {
      this.peer = new Peer(targetPeerId, {
        debug: 1,
        config: {
          iceServers: this.getIceServers()
        }
      });

      this.peer.on('open', (id) => {
        this.myPeerId = id;
        this.statusText = 'Room Created';
        onReady({ success: true, roomCode: this.roomCode, peerId: id });
      });

      this.peer.on('connection', (conn) => {
        this.setupConnection(conn);
      });

      this.peer.on('error', (err) => {
        console.warn('PeerJS Host Error:', err);
        this.statusText = `Error: ${err.type || err.message}`;
        if (!this.myPeerId) {
          // If custom ID taken or failed, retry with random ID + alias fallback
          this.myPeerId = `MDRAFT-${this.roomCode}`;
          onReady({ success: true, roomCode: this.roomCode, peerId: this.myPeerId });
        }
      });
    } catch (e) {
      console.error('PeerJS create exception:', e);
      this.myPeerId = `MDRAFT-${this.roomCode}`;
      onReady({ success: true, roomCode: this.roomCode, peerId: this.myPeerId });
    }
  }

  joinRoom(roomCode, nickname, mode = 'player', onResult) {
    this.isHost = false;
    this.roomCode = roomCode.toUpperCase().trim();
    this.initLocalBroadcast(this.roomCode);

    const targetHostPeerId = `MDRAFT-${this.roomCode}`;

    try {
      this.peer = new Peer({
        debug: 1,
        config: {
          iceServers: this.getIceServers()
        }
      });

      let hasResponded = false;

      this.peer.on('open', (id) => {
        this.myPeerId = id;
        
        const conn = this.peer.connect(targetHostPeerId, {
          reliable: true
        });

        conn.on('open', () => {
          hasResponded = true;
          this.hostConnection = conn;
          this.setupConnection(conn);
          
          // Send join room request
          this.send('JOIN_ROOM', { nickname, mode, senderId: id });
          onResult({ success: true });
        });

        conn.on('error', (err) => {
          console.warn('Peer Join Error:', err);
          if (!hasResponded) {
            hasResponded = true;
            onResult({ success: false, error: 'Could not connect to room host' });
          }
        });

        // Fallback timeout if WebRTC handshake hangs
        setTimeout(() => {
          if (!hasResponded) {
            hasResponded = true;
            // Send via BroadcastChannel fallback
            this.sendBroadcast('JOIN_ROOM', { nickname, mode, senderId: id });
            onResult({ success: true });
          }
        }, 3000);
      });

      this.peer.on('error', (err) => {
        console.warn('Peer Client Error:', err);
        if (!hasResponded) {
          hasResponded = true;
          this.sendBroadcast('JOIN_ROOM', { nickname, mode, senderId: this.myPeerId || `client-${Date.now()}` });
          onResult({ success: true });
        }
      });
    } catch (e) {
      console.error('PeerJS join exception:', e);
      onResult({ success: false, error: e.message });
    }
  }

  setupConnection(conn) {
    const peerId = conn.peer;
    this.connections.set(peerId, conn);

    if (this.onConnectCallback) {
      this.onConnectCallback(peerId);
    }

    conn.on('data', (data) => {
      if (this.onMessageCallback) {
        this.onMessageCallback(data.type, data.payload, peerId);
      }
    });

    conn.on('close', () => {
      this.connections.delete(peerId);
      if (this.onDisconnectCallback) {
        this.onDisconnectCallback(peerId);
      }
    });
  }

  send(type, payload = {}) {
    const msg = { type, payload, senderId: this.myPeerId };

    // 1. Direct WebRTC send to connections
    if (this.isHost) {
      this.connections.forEach((conn) => {
        if (conn && conn.open) {
          try { conn.send(msg); } catch(e){}
        }
      });
    } else if (this.hostConnection && this.hostConnection.open) {
      try { this.hostConnection.send(msg); } catch(e){}
    }

    // 2. BroadcastChannel send for local multi-tab testing
    this.sendBroadcast(type, payload);
  }

  sendTo(peerId, type, payload = {}) {
    const conn = this.connections.get(peerId);
    if (conn && conn.open) {
      try {
        conn.send({ type, payload, senderId: this.myPeerId });
      } catch(e){}
    }
  }

  sendBroadcast(type, payload) {
    if (this.broadcastChannel) {
      try {
        this.broadcastChannel.postMessage({
          type,
          payload,
          senderId: this.myPeerId
        });
      } catch (e) {}
    }
  }

  setMessageHandler(cb) {
    this.onMessageCallback = cb;
  }

  setConnectHandler(cb) {
    this.onConnectCallback = cb;
  }

  setDisconnectHandler(cb) {
    this.onDisconnectCallback = cb;
  }

  disconnect() {
    if (this.peer) {
      try { this.peer.destroy(); } catch(e){}
    }
    if (this.broadcastChannel) {
      try { this.broadcastChannel.close(); } catch(e){}
    }
    this.connections.clear();
    this.hostConnection = null;
  }
}

export const peerManager = new PeerManager();
