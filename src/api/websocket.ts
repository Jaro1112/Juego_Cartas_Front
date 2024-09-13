import { Client } from '@stomp/stompjs';
import { API_BASE_URL } from '../config';
import { PartidaWebSocket } from '../Types';

let client: Client | null = null;

export function connectWebSocket(onConnect: () => void) {
  client = new Client({
    brokerURL: API_BASE_URL.replace('https://', 'wss://').replace('http://', 'ws://') + '/ws',
    onConnect: () => {
      console.log('Connected to WebSocket');
      onConnect();
    },
    onStompError: (frame) => {
      console.error('Broker reported error: ' + frame.headers['message']);
      console.error('Additional details: ' + frame.body);
    },
  });
  client.activate();
}

export function disconnectWebSocket() {
  if (client) {
    client.deactivate();
  }
}

export function subscribeToEmparejamiento(callback: (partida: PartidaWebSocket) => void) {
  if (client) {
    client.subscribe('/topic/emparejamiento', (message) => {
      const partida = JSON.parse(message.body) as PartidaWebSocket;
      callback(partida);
    });
  }
}

export function buscarOponente(jugadorId: number) {
  if (client) {
    client.publish({
      destination: '/app/buscarOponente',
      body: JSON.stringify(jugadorId),
    });
  }
}
