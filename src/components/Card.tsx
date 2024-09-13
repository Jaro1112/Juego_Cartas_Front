import React from 'react';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Card, EfectoTipo } from '../Types';
import styles from './Card.module.css';
import ElementIcon from './ElementIcon';

interface CardProps extends Card {
  onSelect: () => void;
  isSelected: boolean;
  isPlayed?: boolean;
  isOpponent?: boolean;
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const CardComponent: React.FC<CardProps> = ({ id, elemento, poder, efecto, onSelect, isSelected, isPlayed, isOpponent }) => {
  return (
    <div 
      className={`${styles.card} ${isSelected ? styles.selected : ''} ${isPlayed ? styles.played : ''} ${isOpponent ? styles.opponent : ''}`}
      onClick={onSelect}
    >
      <div className={styles.elementIcon}>
        <ElementIcon element={elemento} />
      </div>
      <h3 className={styles.elemento}>{elemento}</h3>
      <p className={styles.poder}>{poder}</p>
      {efecto && <p className={styles.efecto}>{efecto}</p>}
    </div>
  );
};

export default CardComponent;
