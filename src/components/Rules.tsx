import React from 'react';
import styles from './Rules.module.css';

interface RulesProps {
  onBack: () => void;
}

const Rules: React.FC<RulesProps> = ({ onBack }) => {
  return (
    <div className={styles.rulesContainer}>
      <h1 className={styles.title}>Reglas del Juego de Cartas Elementales</h1>
      <div className={styles.rulesContent}>
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Objetivo del Juego</h2>
          <p>Reducir la vida del oponente a 0 puntos usando cartas elementales.</p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Preparación</h2>
          <ul>
            <li>Cada jugador comienza con 20 puntos de vida.</li>
            <li>Cada jugador recibe una mano inicial de 5 cartas.</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Turno de Juego</h2>
          <ol>
            <li>Roba una carta al inicio de tu turno.</li>
            <li>Juega una carta de tu mano.</li>
            <li>Aplica el efecto de la carta jugada.</li>
            <li>El oponente recibe daño igual al poder de la carta jugada.</li>
            <li>Finaliza tu turno.</li>
          </ol>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Elementos y sus Efectos</h2>
          <ul>
            <li><strong>Fuego:</strong> Causa daño adicional.</li>
            <li><strong>Agua:</strong> Permite robar una carta adicional.</li>
            <li><strong>Tierra:</strong> Otorga puntos de vida.</li>
            <li><strong>Aire:</strong> Reduce el daño recibido en el próximo turno.</li>
            <li><strong>Rayo:</strong> Aumenta el poder de la próxima carta jugada.</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Fin del Juego</h2>
          <p>El juego termina cuando la vida de un jugador llega a 0 o menos. El jugador con vida restante gana.</p>
        </section>
      </div>
      <button className={styles.backButton} onClick={onBack}>Volver al Menú</button>
    </div>
  );
};

export default Rules;
