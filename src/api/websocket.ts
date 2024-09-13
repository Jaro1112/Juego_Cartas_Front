import { Client } from '@stomp/stompjs';
import { API_BASE_URL } from '../config';

const client = new Client({
  brokerURL: API_BASE_URL.replace('https://', 'wss://') + '/ws',
  connectHeaders: {
    login: '123',
    passcode: '123',
  },
  debug: function (str) {
    console.log('STOMP: ' + str);
  },
  reconnectDelay: 5000,
  heartbeatIncoming: 4000,
  heartbeatOutgoing: 4000,
  webSocketFactory: () => new WebSocket(API_BASE_URL.replace('https://', 'wss://') + '/ws'),
});

client.onConnect = function (frame) {
  console.log('Connected: ' + frame);
  client.subscribe('/topic/partida', function (message) {
    console.log('Received: ' + message.body);
  });
};

client.onStompError = function (frame) {
  console.error('Broker reported error: ' + frame.headers['message']);
  console.error('Additional details: ' + frame.body);
};

client.onWebSocketError = function (event) {
  console.error('WebSocket Error:', event);
};

export function connectWebSocket() {
  console.log('Attempting to connect to WebSocket...');
  client.activate();
}

export function disconnectWebSocket() {
  console.log('Disconnecting WebSocket...');
  client.deactivate();
}

export function sendMessage(destination: string, body: string) {
  client.publish({ destination, body });
}
