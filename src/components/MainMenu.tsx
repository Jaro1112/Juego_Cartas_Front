import React from 'react';
import styles from './MainMenu.module.css';

interface MainMenuProps {
  onStartGame: () => void;
  onShowRules: () => void;
}

const MainMenu: React.FC<MainMenuProps> = ({ onStartGame, onShowRules }) => {
  return (
    <div className={styles.mainMenu}>
      <h1>Juego de Cartas Elementales</h1>
      <button onClick={onStartGame}>Iniciar Juego</button>
      <button onClick={onShowRules}>Ver Reglas</button>
    </div>
  );
};


export default MainMenu;
