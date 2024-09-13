import React, { useState, useEffect } from 'react';
import { Player, Card } from '../Types';
import Hand from './Hand';
import PlayerInfo from './PlayerInfo';
import CardComponent from './Card';

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
    <div className="flex flex-col items-center justify-between h-screen p-4 bg-green-100">
      {showResult && (
        <div className={`fixed inset-0 flex items-center justify-center z-50 ${ganador === 'player1' ? 'bg-green-500' : 'bg-red-500'}`}>
          <h1 className="text-6xl font-bold text-white">
            {ganador === 'player1' ? 'Ganaste!' : 'Perdiste!'}
          </h1>
        </div>
      )}
      <PlayerInfo name={player2.name} life={player2.life} isCurrentTurn={currentTurn === 2} />
      <Hand cards={player2.hand} onPlayCard={(cardId) => onPlayCard(2, cardId)} isCurrentTurn={currentTurn === 2} />
      
      <div className="flex justify-center items-center space-x-4 my-4">
        {playedCards.player2 && <CardComponent {...playedCards.player2} onSelect={() => {}} isSelected={false} />}
        {playedCards.player1 && <CardComponent {...playedCards.player1} onSelect={() => {}} isSelected={false} />}
        <button 
          onClick={() => onDrawCard(currentTurn)} 
          disabled={ganador !== null}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-400"
        >
          Robar Carta
        </button>
        <button onClick={onSurrender}>Rendirse</button>
      </div>
      
      <Hand cards={player1.hand} onPlayCard={(cardId) => onPlayCard(1, cardId)} isCurrentTurn={currentTurn === 1} />
      <PlayerInfo name={player1.name} life={player1.life} isCurrentTurn={currentTurn === 1} />
      
      <div className="mt-4 p-2 bg-white rounded shadow max-h-32 overflow-y-auto">
        {log.map((entry, index) => (
          <p key={index} className="text-sm">{entry}</p>
        ))}
      </div>
      
      {ganador && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-4 rounded">
            ¡El jugador {ganador} ha ganado!
          </div>
        </div>
      )}
    </div>
  );
};

export default GameBoard;
