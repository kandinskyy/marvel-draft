import mqtt from 'mqtt';
import Peer from 'peerjs';

class PeerManager {
  constructor() {
    this.mqttClient = null;
    this.peer = null;
    this.connections = new Map();
    this.hostConnection = null;
    
    this.roomCode = null;
    this.isHost = false;
    this.myPeerId = `u_${Math.random().toString(36).substring(2, 9)}`;
    this.topic = null;
    
    this.onMessageCallback = null;
    this.onStatusCallback = null;
    this.broadcastChannel = null;
    
    this.isConnected = false;
    this.status = 'Disconnected';

    // Auto re-sync when mobile Safari regains focus
    if (typeof window !== 'undefined') {
      window.addEventListener('focus', () => this.handleVisibilityChange());
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
          this.handleVisibilityChange();
        }
      });
    }
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
      { urls: 'turn:openrelay.metered.ca:80', username: 'openrelayproject', credential: 'openrelayproject' },
      { urls: 'turn:openrelay.metered.ca:443', username: 'openrelayproject', credential: 'openrelayproject' },
      { urls: 'turn:openrelay.metered.ca:443?transport=tcp', username: 'openrelayproject', credential: 'openrelayproject' }
    ];
  }

  updateStatus(newStatus) {
    this.status = newStatus;
    if (this.onStatusCallback) {
      this.onStatusCallback(newStatus);
    }
  }

  handleVisibilityChange() {
    if (this.roomCode && this.mqttClient && !this.isConnected) {
      this.connectMqtt(this.roomCode, () => {});
    }
  }

  initLocalBroadcast(code) {
    if (this.broadcastChannel) {
      try { this.broadcastChannel.close(); } catch(e){}
    }
    try {
      this.broadcastChannel = new BroadcastChannel(`marvel-draft-${code}`);
      this.broadcastChannel.onmessage = (event) => {
        if (event.data.senderId !== this.myPeerId && this.onMessageCallback) {
          this.onMessageCallback(event.data.type, event.data.payload, event.data.senderId);
        }
      };
    } catch(e){}
  }

  connectMqtt(roomCode, onConnected) {
    this.roomCode = roomCode.toUpperCase().trim();
    this.topic = `marvel-draft/room/${this.roomCode}`;
    this.initLocalBroadcast(this.roomCode);

    const brokerUrls = [
      'wss://broker.hivemq.com:8884/mqtt',
      'wss://broker.hivemq.com:8000/mqtt',
      'wss://broker.emqx.io:8084/mqtt'
    ];

    const tryConnect = (idx = 0) => {
      if (idx >= brokerUrls.length) {
        this.updateStatus('Fallback to PeerJS');
        this.initPeerJS(onConnected);
        return;
      }

      this.updateStatus('Connecting...');

      try {
        this.mqttClient = mqtt.connect(brokerUrls[idx], {
          clientId: `mdraft_${this.myPeerId}_${Math.random().toString(36).substring(2, 6)}`,
          keepalive: 20,
          clean: true,
          reconnectPeriod: 2000,
          connectTimeout: 4000
        });

        this.mqttClient.on('connect', () => {
          this.isConnected = true;
          this.updateStatus('Connected 🟢');
          this.mqttClient.subscribe(this.topic, { qos: 1 }, (err) => {
            if (!err) {
              onConnected({ success: true, roomCode: this.roomCode, peerId: this.myPeerId });
            }
          });
        });

        this.mqttClient.on('message', (t, msg) => {
          try {
            const data = JSON.parse(msg.toString());
            if (data.senderId !== this.myPeerId && this.onMessageCallback) {
              this.onMessageCallback(data.type, data.payload, data.senderId);
            }
          } catch(e){}
        });

        this.mqttClient.on('error', (err) => {
          console.warn(`MQTT error on ${brokerUrls[idx]}:`, err);
          try { this.mqttClient.end(); } catch(e){}
          tryConnect(idx + 1);
        });

      } catch(e) {
        tryConnect(idx + 1);
      }
    };

    tryConnect(0);
  }

  initPeerJS(onConnected) {
    const peerId = this.isHost ? `mdraft-${this.roomCode}` : undefined;
    try {
      this.peer = new Peer(peerId, {
        debug: 1,
        config: { iceServers: this.getIceServers() }
      });

      this.peer.on('open', (id) => {
        this.myPeerId = id;
        this.isConnected = true;
        this.updateStatus('PeerJS Connected 🟢');

        if (!this.isHost) {
          const conn = this.peer.connect(`mdraft-${this.roomCode}`, { reliable: true });
          conn.on('open', () => {
            this.hostConnection = conn;
            this.setupConn(conn);
          });
        }
        onConnected({ success: true, roomCode: this.roomCode, peerId: id });
      });

      this.peer.on('connection', (conn) => {
        this.setupConn(conn);
      });
    } catch(e) {
      onConnected({ success: true, roomCode: this.roomCode, peerId: this.myPeerId });
    }
  }

  setupConn(conn) {
    this.connections.set(conn.peer, conn);
    conn.on('data', (data) => {
      if (this.onMessageCallback) {
        this.onMessageCallback(data.type, data.payload, conn.peer);
      }
    });
  }

  createRoom(onReady) {
    this.isHost = true;
    const code = this.generateRoomCode();
    this.connectMqtt(code, (res) => {
      onReady(res);
    });
  }

  joinRoom(roomCode, nickname, mode = 'player', onResult) {
    this.isHost = false;
    this.connectMqtt(roomCode, (res) => {
      if (res.success) {
        setTimeout(() => {
          this.send('JOIN_ROOM', { nickname, mode, senderId: this.myPeerId });
        }, 200);
        onResult({ success: true });
      } else {
        onResult({ success: false });
      }
    });
  }

  send(type, payload = {}) {
    const msgObj = { type, payload, senderId: this.myPeerId };
    const msgString = JSON.stringify(msgObj);

    if (this.mqttClient && this.isConnected) {
      try {
        this.mqttClient.publish(this.topic, msgString, { qos: 1 });
      } catch(e){}
    }

    if (this.hostConnection && this.hostConnection.open) {
      try { this.hostConnection.send(msgObj); } catch(e){}
    }

    this.connections.forEach(conn => {
      if (conn && conn.open) {
        try { conn.send(msgObj); } catch(e){}
      }
    });

    if (this.broadcastChannel) {
      try { this.broadcastChannel.postMessage(msgObj); } catch(e){}
    }
  }

  sendTo(targetPeerId, type, payload = {}) {
    this.send(type, { ...payload, targetPeerId });
  }

  setMessageHandler(cb) {
    this.onMessageCallback = cb;
  }

  setStatusHandler(cb) {
    this.onStatusCallback = cb;
  }

  disconnect() {
    if (this.mqttClient) {
      try { this.mqttClient.end(); } catch(e){}
    }
    if (this.peer) {
      try { this.peer.destroy(); } catch(e){}
    }
    if (this.broadcastChannel) {
      try { this.broadcastChannel.close(); } catch(e){}
    }
    this.isConnected = false;
    this.updateStatus('Disconnected');
  }
}

export const peerManager = new PeerManager();
