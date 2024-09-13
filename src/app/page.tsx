'use client';

import styles from './page.module.css';
import React, { useState, useEffect } from 'react';
import GameBoard from '../components/GameBoard';
import MainMenu from '../components/MainMenu';
import Rules from '../components/Rules';
import LoginRegister from '../components/LoginRegister';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { EfectoTipo, Card, Player, GameState, Usuario } from '../Types';
 // eslint-disable-next-line @typescript-eslint/no-unused-vars
import { iniciarPartida, jugarCarta, robarCarta } from '../api/gameApi';
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
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [showMenu, setShowMenu] = useState(true);
  const [showRules, setShowRules] = useState(false);
  const [usuario, setUsuario] = useState<Usuario | null>(null);

  const handleLogin = (usuarioLogueado: Usuario) => {
    setUsuario(usuarioLogueado);
    setShowMenu(true);
  };

  const handleStartGame = async () => {
    try {
      if (!usuario) {
        throw new Error('No hay usuario logueado');
      }
      console.log('Iniciando partida...');
      const partida = await iniciarPartida(usuario.id);
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
    if (!gameState) {
      console.error('No se puede jugar la carta: el juego no ha sido inicializado');
      return;
    }
    try {
      const updatedGameState = await jugarCarta(gameState.id, playerId, cardId);
      setGameState(updatedGameState);
    } catch (error) {
      console.error('Error al jugar la carta:', error);
    }
  };

  const handleDrawCard = async (playerId: number) => {
    if (!gameState) {
      console.error('No se puede robar la carta: el juego no ha sido inicializado');
      return;
    }
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

  if (!usuario) {
    return <LoginRegister onLogin={handleLogin} />;
  }

  if (showMenu) {
    return (
      <div className={styles.container}>
        <div className={styles.playerInfo}>
          <span className={styles.playerLabel}>Jugador:</span>
          <span className={styles.playerName}>{usuario.username}</span>
        </div>
        <MainMenu onStartGame={handleStartGame} onShowRules={handleShowRules} />
      </div>
    );
  }

  if (showRules) {
    return <Rules onBack={handleBackToMenu} />;
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className={styles.contentWrapper}>
        {gameState ? (
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
        ) : (
          <>
            <MainMenu onStartGame={handleStartGame} onShowRules={handleShowRules} />
            <div className={styles.playerInfo}>
              <span className={styles.playerLabel}>Jugador:</span>
              <span className={styles.playerName}>{usuario.username}</span>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
