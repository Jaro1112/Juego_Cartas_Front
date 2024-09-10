import React from 'react';
import styles from './PlayerInfo.module.css';

export interface PlayerInfoProps {
  name: string;
  life: number;
  isCurrentTurn: boolean;
}

const PlayerInfo: React.FC<PlayerInfoProps> = ({ name, life, isCurrentTurn }) => {
  return (
    <div className={`${styles.playerInfo} ${isCurrentTurn ? styles.currentTurn : ''}`}>
      <h2>{name}</h2>
      <p>Vida: {life}</p>
    </div>
  );
};

export default PlayerInfo;
