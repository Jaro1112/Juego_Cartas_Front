import React, { useState, useEffect } from 'react';
import { Player, Card } from '../Types';
import Hand from './Hand';
import PlayerInfo from './PlayerInfo';
import CardComponent from './Card';
import styles from './GameBoard.module.css';

interface GameBoardProps {
  currentPlayer: Player;
  opponent: Player;
  currentTurn: number;
  onPlayCard: (playerId: number, cardId: number) => void;
  onDrawCard: (playerId: number) => void;
  log: string[];
  ganador: number | null;
  playedCards: {
    currentPlayer: Card | null;
    opponent: Card | null;
  };
  onSurrender: () => void;
  onBackToMenu: () => void;
}

const GameBoard: React.FC<GameBoardProps> = ({ 
// eslint-disable-next-line @typescript-eslint/no-unused-vars
  currentPlayer, opponent, currentTurn, onPlayCard, onDrawCard, log, ganador, playedCards, onSurrender, onBackToMenu 
}) => {
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    if (ganador) {
      setShowResult(true);
    }
  }, [ganador]);

  return (
    <div className={styles.gameBoard}>
      <button onClick={onBackToMenu} className={styles.backButton}>Volver al Menú</button>
      <button onClick={onSurrender} className={styles.surrenderButton}>Rendirse</button>
      
      <PlayerInfo name={opponent.name} life={opponent.life} isCurrentTurn={currentTurn !== currentPlayer.id} />
      <Hand cards={opponent.hand} onPlayCard={() => {}} isCurrentTurn={false} isOpponent={true} />
      
      <div className={styles.playArea}>
        <div className={styles.playedCard}>
        {playedCards.opponent && <CardComponent {...playedCards.opponent} onSelect={() => {}} isSelected={false} isPlayed={true} />}
        </div>
        <div className={styles.playedCard}>
        {playedCards.currentPlayer && <CardComponent {...playedCards.currentPlayer} onSelect={() => {}} isSelected={false} isPlayed={true} />}
        </div>
      </div>
      
      <Hand cards={currentPlayer.hand} onPlayCard={(cardId) => onPlayCard(currentPlayer.id, cardId)} isCurrentTurn={currentTurn === currentPlayer.id} />
      <PlayerInfo name={currentPlayer.name} life={currentPlayer.life} isCurrentTurn={currentTurn === currentPlayer.id} />
      
      <div className={styles.logArea}>
        {log.map((entry, index) => (
          <p key={index} className={styles.logEntry}>{entry}</p>
        ))}
      </div>
      
      {showResult && (
        <div className={`${styles.resultOverlay} ${ganador === currentPlayer.id ? styles.winOverlay : styles.loseOverlay}`}>
          <h1 className={styles.resultText}>
            {ganador === currentPlayer.id ? '¡Ganaste!' : '¡Perdiste!'}
          </h1>
        </div>
      )}
    </div>
  );
}

export default GameBoard;
