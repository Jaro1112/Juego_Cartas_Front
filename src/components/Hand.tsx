import React from 'react';
import { Card } from '../Types';
import CardComponent from './Card';


interface HandProps {
  cards: Card[];
  onPlayCard: (cardId: number) => void;
  isCurrentTurn: boolean;
}

const Hand: React.FC<HandProps> = ({ cards, onPlayCard, isCurrentTurn }) => {
  return (
    <div className={`flex justify-center flex-wrap gap-2 p-2 ${isCurrentTurn ? 'opacity-100' : 'opacity-60 pointer-events-none'}`}>
      {cards.map((card) => (
        <CardComponent 
          key={card.id}
          {...card}
          onSelect={() => onPlayCard(card.id)}
          isSelected={false}
        />
      ))}
    </div>
  );
};

export default Hand;
