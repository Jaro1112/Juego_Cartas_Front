import { API_BASE_URL } from '../config';
import { GameState, PartidaBackend } from '../Types';

export const iniciarPartida = async (jugadorId: number) => {
  try {
    console.log('Iniciando partida con URL:', `${API_BASE_URL}/api/juego/iniciar`);
    const response = await fetch(`${API_BASE_URL}/api/juego/iniciar`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ jugadorId }),
    });
    if (!response.ok) {
      const errorBody = await response.text();
      console.error('Respuesta del servidor no exitosa:', response.status, errorBody);
      throw new Error(`HTTP error! status: ${response.status}, body: ${errorBody}`);
    }
    const data = await response.json();
    console.log('Respuesta del servidor:', data);
    return data;
  } catch (error) {
    console.error('Error detallado en iniciarPartida:', error);
    throw error;
  }
};

export const jugarCarta = async (partidaId: number, jugadorId: number, cartaId: number) => {
  const response = await fetch(`${API_BASE_URL}/juego/jugar-carta`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ partidaId, jugadorId, cartaId }),
  });
  return response.json();
};

export const robarCarta = async (partidaId: number, jugadorId: number): Promise<GameState> => {
  const response = await fetch(`${API_BASE_URL}/juego/robar-carta`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ partidaId, jugadorId }),
  });
  const partida = await response.json();
  return convertirPartidaAGameState(partida);
};

function convertirPartidaAGameState(partida: PartidaBackend): GameState {
  return {
    id: partida.id,
    player1: {
      name: partida.jugador1.username,
      life: partida.jugador1.vida,
      hand: partida.cartasJugador1,
      deck: []
    },
    player2: {
      name: partida.jugador2.username,
      life: partida.jugador2.vida,
      hand: partida.cartasJugador2,
      deck: []
    },
    currentTurn: partida.turnoActual,
    log: [],
    ganador: partida.estado === 'TERMINADO' ? (partida.jugador1.vida > 0 ? 'player1' : 'player2') : null,
    playedCards: { player1: null, player2: null }
  };
}

export const crearOObtenerUsuario = async (username: string) => {
  try {
    const response = await fetch(`/api/usuarios`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username }),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  } catch (error) {
    console.error('Error al crear o obtener usuario:', error);
    throw error;
  }
};
