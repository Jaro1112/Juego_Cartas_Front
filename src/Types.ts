export type EfectoTipo = 'QUEMAR' | 'CURAR' | 'ROBAR_CARTA';

export interface Card {
  id: number;
  elemento: string;
  poder: number;
  efecto: EfectoTipo | null;
}

export interface Player {
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

export interface PartidaBackend {
  id: number;
  jugador1: {
    username: string;
    vida: number;
  };
  jugador2: {
    username: string;
    vida: number;
  };
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
