import React from 'react';
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
  currentPlayer,
  opponent,
  currentTurn,
  onPlayCard,
  onDrawCard,
  log,
  ganador,
  playedCards,
  onSurrender,
  onBackToMenu
}) => {
  return (
    <div className={styles.gameBoard}>
      <PlayerInfo name={opponent.name} life={opponent.life} isCurrentTurn={currentTurn === opponent.id} />
      <div className={styles.playArea}>
        <div className={styles.playedCards}>
          {playedCards.opponent && (
            <CardComponent 
              {...playedCards.opponent}
              onSelect={() => {}}
              isSelected={false}
              isOpponent={true}
            />
          )}
          {playedCards.currentPlayer && (
            <CardComponent 
              {...playedCards.currentPlayer}
              onSelect={() => {}}
              isSelected={false}
              isOpponent={false}
            />
          )}
        </div>
      </div>
      <PlayerInfo name={currentPlayer.name} life={currentPlayer.life} isCurrentTurn={currentTurn === currentPlayer.id} />
      <Hand
          cards={currentPlayer.hand}
          onPlayCard={(cardId) => onPlayCard(currentPlayer.id, cardId)}
          isCurrentTurn={currentTurn === currentPlayer.id}
          isOpponent={false}
        />
      <button onClick={() => onDrawCard(currentPlayer.id)} disabled={currentTurn !== currentPlayer.id}>
        Robar carta
      </button>
      <button onClick={onSurrender}>Rendirse</button>
      <button onClick={onBackToMenu}>Volver al menú</button>
      <div className={styles.log}>
        {log.map((entry, index) => (
          <p key={index}>{entry}</p>
        ))}
      </div>
      {ganador !== null && (
        <div className={styles.gameOver}>
          <h2>Juego terminado</h2>
          <p>Ganador: {ganador === currentPlayer.id ? currentPlayer.name : opponent.name}</p>
        </div>
      )}
    </div>
  );
};

export default GameBoard;