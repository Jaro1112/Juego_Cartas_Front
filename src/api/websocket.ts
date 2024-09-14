import { Client } from '@stomp/stompjs';
import { API_BASE_URL } from '../config';
import { PartidaWebSocket } from '../Types';

interface PartidaEvent {
  tipo: string;
  jugadorRendidoId?: number;
  
}

let client: Client | null = null;

let isSubscribedToEmparejamiento = false;

export function connectWebSocket(onConnect: () => void, onError: () => void) {
  client = new Client({
    brokerURL: API_BASE_URL.replace('https://', 'wss://').replace('http://', 'ws://') + '/ws',
    onConnect: () => {
      console.log('Connected to WebSocket');
      if (client && !isSubscribedToEmparejamiento) {
        client.subscribe('/topic/emparejamiento', () => {
          console.log('Subscribed to /topic/emparejamiento');
          isSubscribedToEmparejamiento = true;
        });
      }
      onConnect();
    },
    onStompError: (frame) => {
      console.error('Broker reported error: ' + frame.headers['message']);
      console.error('Additional details: ' + frame.body);
      onError();
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
  if (client && !isSubscribedToEmparejamiento) {
    client.subscribe('/topic/emparejamiento', (message) => {
      const partida = JSON.parse(message.body) as PartidaWebSocket;
      callback(partida);
    });
    isSubscribedToEmparejamiento = true;
  } else if (!client) {
    console.error('Cannot subscribe: WebSocket client is not initialized');
  }
}

export function buscarOponente(jugadorId: number, onTimeUpdate: (remainingTime: number) => void) {
  if (client) {
    client.publish({
      destination: '/app/buscarOponente',
      body: JSON.stringify(jugadorId),
    });

    let remainingTime = 30;
    const intervalId = setInterval(() => {
      remainingTime--;
      onTimeUpdate(remainingTime);
      if (remainingTime <= 0) {
        clearInterval(intervalId);
      }
    }, 1000);

    return () => clearInterval(intervalId);
  }
}

export function subscribeToPartida(partidaId: number, callback: (data: PartidaEvent) => void): () => void {
  if (client && client.connected) {
    const subscription = client.subscribe(`/topic/partida/${partidaId}`, (message) => {
      const data = JSON.parse(message.body) as PartidaEvent;
      callback(data);
    });
    return () => subscription.unsubscribe();
  } else {
    console.error('Cannot subscribe: WebSocket client is not connected');
    return () => {};
  }
}
