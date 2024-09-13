'use client';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { API_BASE_URL } from '../config';
import styles from './page.module.css';
import React, { useState, useEffect, useRef } from 'react';
import GameBoard from '../components/GameBoard';
import MainMenu from '../components/MainMenu';
import Rules from '../components/Rules';
import LoginRegister from '../components/LoginRegister';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { EfectoTipo, Card, Player, GameState, Usuario, PartidaBackend, PartidaWebSocket } from '../Types';
import { iniciarPartida, jugarCarta, robarCarta, crearOObtenerUsuario, rendirse } from '../api/gameApi';
import { connectWebSocket, disconnectWebSocket, subscribeToEmparejamiento, buscarOponente, subscribeToPartida } from '../api/websocket';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const efectos: Record<EfectoTipo, (state: GameState, isCurrentPlayer: boolean) => GameState> = {
  QUEMAR: (state, isCurrentPlayer) => {
    const targetPlayer = isCurrentPlayer ? 'opponent' : 'currentPlayer';
    return {
      ...state,
      [targetPlayer]: {
        ...state[targetPlayer],
        life: state[targetPlayer].life - 2
      },
      log: [...state.log, `${state[targetPlayer].name} recibió 2 de daño adicional por quemadura.`]
    };
  },
  CURAR: (state, isCurrentPlayer) => {
    const targetPlayer = isCurrentPlayer ? 'currentPlayer' : 'opponent';
    return {
      ...state,
      [targetPlayer]: {
        ...state[targetPlayer],
        life: Math.min(state[targetPlayer].life + 3, 20)
      },
      log: [...state.log, `${state[targetPlayer].name} se curó 3 puntos de vida.`]
    };
  },
  ROBAR_CARTA: (state, isCurrentPlayer) => {
    const targetPlayer = isCurrentPlayer ? 'currentPlayer' : 'opponent';
    if (state[targetPlayer].deck.length > 0) {
      const [newCard, ...restDeck] = state[targetPlayer].deck;
      return {
        ...state,
        [targetPlayer]: {
          ...state[targetPlayer],
          hand: [...state[targetPlayer].hand, newCard],
          deck: restDeck
        },
        log: [...state.log, `${state[targetPlayer].name} robó una carta adicional.`]
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
  const [buscandoOponente, setBuscandoOponente] = useState(false);
  const [tiempoEspera, setTiempoEspera] = useState(0);
  const [searchCancelled, setSearchCancelled] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const intervalIdRef = useRef<NodeJS.Timeout | null>(null);

  const handleLogin = (usuarioLogueado: Usuario) => {
    setUsuario(usuarioLogueado);
    setShowMenu(true);
  };

  const handleStartGame = async () => {
    try {
      if (!usuario || !usuario.username) {
        throw new Error('No hay usuario logueado o falta el nombre de usuario');
      }

      setBuscandoOponente(true);
      setTiempoEspera(30);
      setSearchCancelled(false);

      console.log('Creando o obteniendo usuario...');
      const nuevoUsuario = await crearOObtenerUsuario(usuario.username);
      setUsuario(nuevoUsuario);
      console.log('Usuario creado/obtenido:', nuevoUsuario);

      if (!nuevoUsuario.id) {
        throw new Error('No se pudo obtener un ID de usuario válido');
      }

      connectWebSocket(() => {
        subscribeToEmparejamiento((partida) => {
          if (partida) {
            handlePartidaIniciada(partida);
          }
        });
        buscarOponente(nuevoUsuario.id);
      });

      // Esperar 30 segundos antes de iniciar la partida con un bot
      searchTimeoutRef.current = setTimeout(async () => {
        if (!searchCancelled) {
          disconnectWebSocket();
          console.log('Iniciando partida con bot para usuario ID:', nuevoUsuario.id);
          const partida = await iniciarPartida(nuevoUsuario.id);
          handlePartidaIniciada(partida);
        }
      }, 30000);

    } catch (error) {
      console.error('Error al iniciar la partida:', error);
      setBuscandoOponente(false);
      setTiempoEspera(0);
    }
  };

  const handlePartidaIniciada = (partida: PartidaBackend | PartidaWebSocket) => {
    setBuscandoOponente(false);
    setTiempoEspera(0);
  
    if (!partida || !partida.id) {
      throw new Error('La respuesta del servidor no contiene los datos esperados');
    }
  
    const isPlayer1 = partida.jugador1.id === usuario?.id;
  
    const newGameState: GameState = {
      id: partida.id,
      currentPlayer: {
        id: isPlayer1 ? partida.jugador1.id : partida.jugador2.id,
        name: isPlayer1 ? partida.jugador1.username : partida.jugador2.username,
        life: isPlayer1 ? (partida.jugador1.vida ?? 20) : (partida.jugador2.vida ?? 20),
        hand: [],
        deck: []
      },
      opponent: {
        id: isPlayer1 ? partida.jugador2.id : partida.jugador1.id,
        name: isPlayer1 ? partida.jugador2.username : partida.jugador1.username,
        life: isPlayer1 ? (partida.jugador2.vida ?? 20) : (partida.jugador1.vida ?? 20),
        hand: [],
        deck: []
      },
      currentTurn: partida.turnoActual,
      log: [],
      ganador: null,
      playedCards: { currentPlayer: null, opponent: null }
    };
  
    if ('cartasJugador1' in partida) {
      newGameState.currentPlayer.hand = isPlayer1 ? partida.cartasJugador1 : partida.cartasJugador2;
      newGameState.opponent.hand = isPlayer1 ? partida.cartasJugador2 : partida.cartasJugador1;
    }
  
    setGameState(newGameState);
    setShowMenu(false);
  };

  const handleShowRules = () => {
    setShowRules(true);
    setShowMenu(false);
  };

  const handleBackToMenu = () => {
    setShowRules(false);
    setShowMenu(true);
    setGameState(null);
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
    if (state.currentPlayer.life <= 0) {
      return { ...state, ganador: state.opponent.id };
    } else if (state.opponent.life <= 0) {
      return { ...state, ganador: state.currentPlayer.id };
    }
    return state;
  };

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

  const handleCancelSearch = () => {
    setSearchCancelled(true);
    setBuscandoOponente(false);
    setTiempoEspera(0);
    setShowMenu(true);
    // Limpiar cualquier temporizador pendiente
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    // Limpiar el intervalo de cuenta regresiva
    if (intervalIdRef.current) {
      clearInterval(intervalIdRef.current);
    }
  };

  const handleSurrender = async () => {
    if (gameState && usuario) {
      try {
        await rendirse(gameState.id, usuario.id);
        setGameState(null);
        setShowMenu(true);
        disconnectWebSocket();
        connectWebSocket(() => {
          console.log('WebSocket reconectado después de rendirse');
        });
      } catch (error) {
        console.error('Error al rendirse:', error);
        alert('Hubo un error al intentar rendirse. Por favor, intenta de nuevo.');
      }
    }
  };

  useEffect(() => {
    connectWebSocket(() => {
      console.log('WebSocket conectado');
    });
    return () => {
      disconnectWebSocket();
    };
  }, []);

  useEffect(() => {
    if (gameState) {
      const unsubscribe = subscribeToPartida(gameState.id, (data) => {
        if (data.tipo === 'RENDICION') {
          const surrenderingPlayerId = data.jugadorRendidoId;
          setGameState(prevState => {
            if (!prevState) return null;
            const winningPlayer = prevState.currentPlayer.id === surrenderingPlayerId ? 'opponent' : 'currentPlayer';
            return {
              ...prevState,
              currentPlayer: {
                ...prevState.currentPlayer,
                life: prevState.currentPlayer.id === surrenderingPlayerId ? 0 : prevState.currentPlayer.life
              },
              opponent: {
                ...prevState.opponent,
                life: prevState.opponent.id === surrenderingPlayerId ? 0 : prevState.opponent.life
              },
              ganador: prevState[winningPlayer].id
            };
          });
        }
      });
  
      return () => {
        if (unsubscribe) unsubscribe();
      };
    }
  }, [gameState]);

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
        {!buscandoOponente ? (
          <MainMenu onStartGame={handleStartGame} onShowRules={handleShowRules} />
        ) : (
          <div className={`${styles.buscandoOponente} ${styles.container}`}>
            <p>Encontrando Oponente</p>
            <p>Tiempo de espera: {tiempoEspera} segundos</p>
            <button onClick={handleCancelSearch}>Cancelar</button>
          </div>
        )}
      </div>
    );
  }

  if (showRules) {
    return <Rules onBack={handleBackToMenu} />;
  }

  return (
    <main className="min-h-screen w-full">
      {gameState ? (
        <GameBoard 
        currentPlayer={gameState.currentPlayer}
        opponent={gameState.opponent}
        currentTurn={gameState.currentTurn}
        onPlayCard={handlePlayCard}
        onDrawCard={handleDrawCard}
        log={gameState.log}
        ganador={gameState.ganador}
        playedCards={gameState.playedCards}
        onSurrender={handleSurrender}
        onBackToMenu={handleBackToMenu}
      />
      ) : (
        <div className={styles.container}>
          <MainMenu onStartGame={handleStartGame} onShowRules={handleShowRules} />
          <div className={styles.playerInfo}>
            <span className={styles.playerLabel}>Jugador:</span>
            <span className={styles.playerName}>{usuario.username}</span>
          </div>
        </div>
      )}
    </main>
  );
} 
