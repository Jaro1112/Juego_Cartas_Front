import { Client } from '@stomp/stompjs';
import { API_BASE_URL } from '../config';

const client = new Client({
  brokerURL: `${API_BASE_URL.replace('http', 'ws')}/ws`,
  connectHeaders: {
    login: '123',
    passcode: '123',
  },
  debug: function (str) {
    console.log(str);
  },
  reconnectDelay: 5000,
  heartbeatIncoming: 4000,
  heartbeatOutgoing: 4000,
});

client.onConnect = function (frame) {
  console.log('Connected: ' + frame);
  client.subscribe('/topic/partida', function (message) {
    console.log('Received: ' + message.body);
    // Aquí puedes manejar los mensajes recibidos
  });
};

client.onStompError = function (frame) {
  console.log('Broker reported error: ' + frame.headers['message']);
  console.log('Additional details: ' + frame.body);
};

export function connectWebSocket() {
  client.activate();
}

export function disconnectWebSocket() {
  client.deactivate();
}

export function sendMessage(destination: string, body: string) {
  client.publish({ destination, body });
}
