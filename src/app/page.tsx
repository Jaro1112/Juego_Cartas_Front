'use client';

import React, { useState, useEffect } from 'react';
import GameBoard from '../components/GameBoard';
import MainMenu from '../components/MainMenu';
import Rules from '../components/Rules';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { EfectoTipo, Card, Player, GameState } from '../Types';
 // eslint-disable-next-line @typescript-eslint/no-unused-vars
import { iniciarPartida, jugarCarta, robarCarta, crearOObtenerUsuario } from '../api/gameApi';
import { connectWebSocket, disconnectWebSocket } from '../api/websocket';

 // eslint-disable-next-line @typescript-eslint/no-unused-vars
const efectos: Record<EfectoTipo, (state: GameState, currentPlayer: 'player1' | 'player2', otherPlayer: 'player1' | 'player2') => GameState> = {
  QUEMAR: (state, _currentPlayer, otherPlayer) => {
    return {
      ...state,
      [otherPlayer]: {
        ...state[otherPlayer],
        life: state[otherPlayer].life - 2
      },
      log: [...state.log, `${state[otherPlayer].name} recibió 2 de daño adicional por quemadura.`]
    };
  },
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  CURAR: (state, currentPlayer, _otherPlayer) => {
    return {
      ...state,
      [currentPlayer]: {
        ...state[currentPlayer],
        life: Math.min(state[currentPlayer].life + 3, 20)
      },
      log: [...state.log, `${state[currentPlayer].name} se curó 3 puntos de vida.`]
    };
  },
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ROBAR_CARTA: (state, currentPlayer, _otherPlayer) => {
    if (state[currentPlayer].deck.length > 0) {
      const [newCard, ...restDeck] = state[currentPlayer].deck;
      return {
        ...state,
        [currentPlayer]: {
          ...state[currentPlayer],
          hand: [...state[currentPlayer].hand, newCard],
          deck: restDeck
        },
        log: [...state.log, `${state[currentPlayer].name} robó una carta adicional.`]
      };
    }
    return state;
  }
};

export default function Home() {
  const [gameState, setGameState] = useState<GameState>({
    id: 0, // Añadimos un id inicial
    player1: { name: 'Jugador 1', life: 20, hand: [], deck: [] },
    player2: { name: 'Jugador 2', life: 20, hand: [], deck: [] },
    currentTurn: 1,
    log: [],
    ganador: null,
    playedCards: { player1: null, player2: null }
  });
  const [showMenu, setShowMenu] = useState(true);
  const [showRules, setShowRules] = useState(false);

  const handleStartGame = async () => {
    try {
      console.log('Iniciando partida...');
      // Primero, crear o obtener usuarios
      const jugador1 = await crearOObtenerUsuario('Jugador 1');
      const jugador2 = await crearOObtenerUsuario('Jugador 2');
      
      const partida = await iniciarPartida(jugador1.id, jugador2.id);
      console.log('Partida iniciada:', partida);
      if (!partida || !partida.id) {
        throw new Error('La respuesta del servidor no contiene los datos esperados');
      }
      const newGameState = {
        id: partida.id,
        player1: { 
          name: partida.jugador1.username, 
          life: partida.jugador1.vida, 
          hand: partida.cartasJugador1 || [], 
          deck: [] 
        },
        player2: { 
          name: partida.jugador2.username, 
          life: partida.jugador2.vida, 
          hand: partida.cartasJugador2 || [], 
          deck: [] 
        },
        currentTurn: partida.turnoActual,
        log: [],
        ganador: null,
        playedCards: { player1: null, player2: null }
      };
      console.log('Nuevo estado del juego:', newGameState);
      setGameState(newGameState);
      setShowMenu(false);
      console.log('Menú oculto, juego iniciado');
    } catch (error) {
      console.error('Error al iniciar la partida:', error);
      // Aquí podrías mostrar un mensaje de error al usuario
    }
  };

  const handleShowRules = () => {
    setShowRules(true);
    setShowMenu(false);
  };

  const handleBackToMenu = () => {
    setShowRules(false);
    setShowMenu(true);
  };

  const handlePlayCard = async (playerId: number, cardId: number) => {
    try {
      const updatedGameState = await jugarCarta(gameState.id, playerId, cardId);
      setGameState(updatedGameState);
    } catch (error) {
      console.error('Error al jugar la carta:', error);
    }
  };

  const handleDrawCard = async (playerId: number) => {
    try {
      const updatedGameState = await robarCarta(gameState.id, playerId);
      setGameState(updatedGameState);
    } catch (error) {
      console.error('Error al robar la carta:', error);
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const calcularDaño = (cartaAtacante: Card, cartaDefensora: Card | null): number => {
    let daño = cartaAtacante.poder;
    
    if (cartaDefensora) {
      // Implementar ventajas/desventajas elementales
      if (
        (cartaAtacante.elemento === 'FUEGO' && cartaDefensora.elemento === 'TIERRA') ||
        (cartaAtacante.elemento === 'AGUA' && cartaDefensora.elemento === 'FUEGO') ||
        (cartaAtacante.elemento === 'TIERRA' && cartaDefensora.elemento === 'RAYO') ||
        (cartaAtacante.elemento === 'RAYO' && cartaDefensora.elemento === 'AGUA') ||
        (cartaAtacante.elemento === 'AIRE' && cartaDefensora.elemento === 'TIERRA')
      ) {
        daño += 2;
      } else if (
        (cartaDefensora.elemento === 'FUEGO' && cartaAtacante.elemento === 'TIERRA') ||
        (cartaDefensora.elemento === 'AGUA' && cartaAtacante.elemento === 'FUEGO') ||
        (cartaDefensora.elemento === 'TIERRA' && cartaAtacante.elemento === 'RAYO') ||
        (cartaDefensora.elemento === 'RAYO' && cartaAtacante.elemento === 'AGUA') ||
        (cartaDefensora.elemento === 'AIRE' && cartaAtacante.elemento === 'TIERRA')
      ) {
        daño -= 1;
      }
    }
    
    return Math.max(daño, 0);
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const verificarEstadoJuego = (state: GameState): GameState => {
    if (state.player1.life <= 0) {
      return { ...state, ganador: 'player2' };
    } else if (state.player2.life <= 0) {
      return { ...state, ganador: 'player1' };
    }
    return state;
  };

  // Función para crear el mazo inicial
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const createInitialDeck = (): Card[] => {
    const elementos = ['FUEGO', 'AGUA', 'TIERRA', 'AIRE', 'RAYO'];
    const efectos: (EfectoTipo | null)[] = ['QUEMAR', 'CURAR', 'ROBAR_CARTA', null];
    const deck: Card[] = [];

    for (let i = 0; i < 40; i++) {
      deck.push({
        id: i,
        elemento: elementos[Math.floor(Math.random() * elementos.length)],
        poder: Math.floor(Math.random() * 5) + 1,
        efecto: efectos[Math.floor(Math.random() * efectos.length)]
      });
    }

    return deck.sort(() => Math.random() - 0.5); // Mezclar el mazo
  };

  useEffect(() => {
    connectWebSocket();
    return () => {
      disconnectWebSocket();
    };
  }, []);

  if (showMenu) {
    return <MainMenu onStartGame={handleStartGame} onShowRules={handleShowRules} />;
  }

  if (showRules) {
    return <Rules onBack={handleBackToMenu} />;
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <GameBoard 
        player1={gameState.player1}
        player2={gameState.player2}
        currentTurn={gameState.currentTurn}
        onPlayCard={handlePlayCard}
        onDrawCard={handleDrawCard}
        log={gameState.log}
        ganador={gameState.ganador}
        playedCards={gameState.playedCards}
      />
    </main>
  );
}
