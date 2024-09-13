import React, { useState, useEffect } from 'react';
import { Player, Card } from '../Types';
import Hand from './Hand';
import PlayerInfo from './PlayerInfo';
import CardComponent from './Card';
import styles from './GameBoard.module.css';

interface GameBoardProps {
  player1: Player;
  player2: Player;
  currentTurn: number;
  onPlayCard: (playerId: number, cardId: number) => void;
  onDrawCard: (playerId: number) => void;
  log: string[];
  ganador: "player1" | "player2" | null;
  playedCards: {
    player1: Card | null;
    player2: Card | null;
  };
  onSurrender: () => void;
  onBackToMenu: () => void;
}

const GameBoard: React.FC<GameBoardProps> = ({ 
  player1, player2, currentTurn, onPlayCard, onDrawCard, log, ganador, playedCards, onSurrender, onBackToMenu 
}) => {
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    if (ganador) {
      setShowResult(true);
      setTimeout(() => {
        setShowResult(false);
        onBackToMenu();
      }, 3000);
    }
  }, [ganador, onBackToMenu]);

  return (
    <div className={styles.gameBoard}>
      <PlayerInfo name={player2.name} life={player2.life} isCurrentTurn={currentTurn === 2} />
      <Hand cards={player2.hand} onPlayCard={(cardId) => onPlayCard(2, cardId)} isCurrentTurn={currentTurn === 2} />
      
      <div className={styles.playArea}>
        {playedCards.player2 && <CardComponent {...playedCards.player2} onSelect={() => {}} isSelected={false} />}
        {playedCards.player1 && <CardComponent {...playedCards.player1} onSelect={() => {}} isSelected={false} />}
      </div>
      
      <div className={styles.centerArea}>
        <button 
          onClick={() => onDrawCard(currentTurn)} 
          disabled={ganador !== null}
          className={styles.playButton}
        >
          Robar Carta
        </button>
        <button onClick={onSurrender} className={styles.surrenderButton}>Rendirse</button>
      </div>
      
      <Hand cards={player1.hand} onPlayCard={(cardId) => onPlayCard(1, cardId)} isCurrentTurn={currentTurn === 1} />
      <PlayerInfo name={player1.name} life={player1.life} isCurrentTurn={currentTurn === 1} />
      
      <div className={styles.logArea}>
        {log.map((entry, index) => (
          <p key={index} className={styles.logEntry}>{entry}</p>
        ))}
      </div>
      
      {showResult && (
        <div className={`${styles.resultOverlay} ${ganador === 'player1' ? styles.winOverlay : styles.loseOverlay}`}>
          <h1 className={styles.resultText}>
            {ganador === 'player1' ? '¡Ganaste!' : '¡Perdiste!'}
          </h1>
        </div>
      )}
    </div>
  );
};

export default GameBoard;
