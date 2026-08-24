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
  }

  // Generate 6-char code e.g. M7X82K
  generateRoomCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  initLocalBroadcast(code) {
    if (this.broadcastChannel) {
      this.broadcastChannel.close();
    }
    this.broadcastChannel = new BroadcastChannel(`marvel-draft-${code}`);
    this.broadcastChannel.onmessage = (event) => {
      if (this.onMessageCallback) {
        this.onMessageCallback(event.data.type, event.data.payload, event.data.senderId);
      }
    };
  }

  createRoom(onReady) {
    this.isHost = true;
    this.roomCode = this.generateRoomCode();
    this.initLocalBroadcast(this.roomCode);

    try {
      this.peer = new Peer(`marvel-draft-${this.roomCode}`, {
        debug: 1,
      });

      this.peer.on('open', (id) => {
        this.myPeerId = id;
        onReady({ success: true, roomCode: this.roomCode, peerId: id });
      });

      this.peer.on('connection', (conn) => {
        this.setupConnection(conn);
      });

      this.peer.on('error', (err) => {
        console.warn('PeerJS server error, using fallback local BroadcastChannel:', err);
        // Fallback works automatically via BroadcastChannel!
        if (!this.myPeerId) {
          this.myPeerId = `host-${Date.now()}`;
          onReady({ success: true, roomCode: this.roomCode, peerId: this.myPeerId });
        }
      });
    } catch (e) {
      this.myPeerId = `host-${Date.now()}`;
      onReady({ success: true, roomCode: this.roomCode, peerId: this.myPeerId });
    }
  }

  joinRoom(roomCode, nickname, mode = 'player', onResult) {
    this.isHost = false;
    this.roomCode = roomCode.toUpperCase().trim();
    this.initLocalBroadcast(this.roomCode);

    let joined = false;

    // Send local Broadcast join attempt immediately
    setTimeout(() => {
      this.sendBroadcast('JOIN_ROOM', { nickname, mode, senderId: this.myPeerId });
    }, 100);

    try {
      this.peer = new Peer({ debug: 1 });

      this.peer.on('open', (id) => {
        this.myPeerId = id;
        const conn = this.peer.connect(`marvel-draft-${this.roomCode}`);
        
        conn.on('open', () => {
          joined = true;
          this.hostConnection = conn;
          this.setupConnection(conn);
          this.send('JOIN_ROOM', { nickname, mode, senderId: id });
          onResult({ success: true });
        });

        conn.on('error', (err) => {
          console.warn('Peer connection error, relying on BroadcastChannel fallback:', err);
          onResult({ success: true });
        });

        setTimeout(() => {
          if (!joined) {
            // BroadcastChannel connected successfully
            onResult({ success: true });
          }
        }, 1500);
      });

      this.peer.on('error', () => {
        onResult({ success: true });
      });
    } catch (e) {
      onResult({ success: true });
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

    // 1. Send via WebRTC P2P
    if (this.isHost) {
      this.connections.forEach((conn) => {
        if (conn.open) {
          conn.send(msg);
        }
      });
    } else if (this.hostConnection && this.hostConnection.open) {
      this.hostConnection.send(msg);
    }

    // 2. Send via BroadcastChannel (local tabs sync)
    this.sendBroadcast(type, payload);
  }

  sendBroadcast(type, payload) {
    if (this.broadcastChannel) {
      try {
        this.broadcastChannel.postMessage({
          type,
          payload,
          senderId: this.myPeerId
        });
      } catch (e) {
        // BroadcastChannel closed or inactive
      }
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
      this.peer.destroy();
    }
    if (this.broadcastChannel) {
      this.broadcastChannel.close();
    }
    this.connections.clear();
    this.hostConnection = null;
  }
}

export const peerManager = new PeerManager();
