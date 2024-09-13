export type EfectoTipo = 'QUEMAR' | 'CURAR' | 'ROBAR_CARTA';

export interface Card {
  id: number;
  elemento: string;
  poder: number;
  efecto: EfectoTipo | null;
}

export interface Player {
  id: number;
  name: string;
  life: number;
  hand: Card[];
  deck: Card[];
}

export interface GameState {
  id: number; 
  player1: Player;
  player2: Player;
  currentTurn: number;
  log: string[];
  ganador: 'player1' | 'player2' | null;
  playedCards: { player1: Card | null, player2: Card | null };
}

interface Jugador {
  id: number;
  username: string;
  vida?: number;
}

export interface PartidaBackend {
  id: number;
  jugador1: Jugador;
  jugador2: Jugador;
  cartasJugador1: Card[];
  cartasJugador2: Card[];
  turnoActual: number;
  estado: string;
}

export interface Usuario {
  id: number;
  username: string;
  email: string;
}

export interface PartidaWebSocket {
  id: number;
  turnoActual: number;
  jugador1: Jugador;
  jugador2: Jugador;
  tipo: string;
  jugadorRendidoId?: number;
}
