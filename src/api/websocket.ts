import { Client } from '@stomp/stompjs';
import { API_BASE_URL } from '../config';
import { PartidaWebSocket } from '../Types';

interface PartidaEvent {
  tipo: string;
  jugadorRendidoId?: number;
  // Añade aquí otras propiedades que pueda tener el evento
}

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
  if (client) {
    const subscription = client.subscribe(`/topic/partida/${partidaId}`, (message) => {
      const data = JSON.parse(message.body) as PartidaEvent;
      callback(data);
    });
    return () => subscription.unsubscribe();
  }
  return () => {};
}
