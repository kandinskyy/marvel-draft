import mqtt from 'mqtt';

class PeerManager {
  constructor() {
    this.client = null;
    this.roomCode = null;
    this.isHost = false;
    this.myPeerId = `user_${Math.random().toString(36).substring(2, 9)}`;
    this.topic = null;
    this.onMessageCallback = null;
    this.onConnectCallback = null;
    this.onDisconnectCallback = null;
    this.broadcastChannel = null;
    this.isConnected = false;
  }

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

    // Public WebSocket brokers for instant cross-device connectivity
    const brokerUrls = [
      'wss://broker.hivemq.com:8000/mqtt',
      'wss://broker.emqx.io:8084/mqtt',
      'wss://test.mosquitto.org:8081'
    ];

    const connectToBroker = (urlIndex = 0) => {
      if (urlIndex >= brokerUrls.length) {
        console.warn('All MQTT brokers failed, relying on BroadcastChannel');
        onConnected({ success: true, roomCode: this.roomCode, peerId: this.myPeerId });
        return;
      }

      const brokerUrl = brokerUrls[urlIndex];
      try {
        this.client = mqtt.connect(brokerUrl, {
          clientId: `marvel_${this.myPeerId}_${Math.random().toString(36).substring(2, 6)}`,
          keepalive: 30,
          clean: true,
          reconnectPeriod: 2000,
          connectTimeout: 5000
        });

        this.client.on('connect', () => {
          this.isConnected = true;
          this.client.subscribe(this.topic, { qos: 1 }, (err) => {
            if (!err) {
              onConnected({ success: true, roomCode: this.roomCode, peerId: this.myPeerId });
            }
          });
        });

        this.client.on('message', (topic, message) => {
          try {
            const data = JSON.parse(message.toString());
            // Ignore messages sent by ourselves
            if (data.senderId !== this.myPeerId && this.onMessageCallback) {
              this.onMessageCallback(data.type, data.payload, data.senderId);
            }
          } catch(e){}
        });

        this.client.on('error', (err) => {
          console.warn(`MQTT broker ${brokerUrl} error:`, err);
          try { this.client.end(); } catch(e){}
          connectToBroker(urlIndex + 1);
        });

      } catch(e) {
        connectToBroker(urlIndex + 1);
      }
    };

    connectToBroker(0);
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
        // Send JOIN_ROOM message to host
        setTimeout(() => {
          this.send('JOIN_ROOM', { nickname, mode, senderId: this.myPeerId });
        }, 300);
        onResult({ success: true });
      } else {
        onResult({ success: false });
      }
    });
  }

  send(type, payload = {}) {
    const msgObj = { type, payload, senderId: this.myPeerId };
    const msgString = JSON.stringify(msgObj);

    // Send via MQTT WebSocket broker
    if (this.client && this.isConnected) {
      try {
        this.client.publish(this.topic, msgString, { qos: 1 });
      } catch(e){}
    }

    // Also send via local BroadcastChannel for same-device multi-tab testing
    if (this.broadcastChannel) {
      try {
        this.broadcastChannel.postMessage(msgObj);
      } catch(e){}
    }
  }

  sendTo(targetPeerId, type, payload = {}) {
    // In MQTT pub/sub room topic, send with targetPeerId field
    this.send(type, { ...payload, targetPeerId });
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
    if (this.client) {
      try { this.client.end(); } catch(e){}
    }
    if (this.broadcastChannel) {
      try { this.broadcastChannel.close(); } catch(e){}
    }
    this.isConnected = false;
  }
}

export const peerManager = new PeerManager();
