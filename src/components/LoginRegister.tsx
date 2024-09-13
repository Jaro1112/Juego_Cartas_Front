import React, { useState } from 'react';
import { registrarUsuario, login } from '../api/usuarioApi';
import styles from '../styles/LoginRegister.module.css';

interface Usuario {
  id: number;
  username: string;
  email: string;
}

interface LoginRegisterProps {
  onLogin: (usuario: Usuario) => void;
}

const LoginRegister: React.FC<LoginRegisterProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      if (isLogin) {
        const usuario = await login(email, password);
        onLogin(usuario);
      } else {
        await registrarUsuario(username, email, password);
        setIsLogin(true);
      }
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Ha ocurrido un error desconocido');
      }
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.formContainer}>
        <h2 className={styles.title}>{isLogin ? 'Iniciar sesión' : 'Registrarse'}</h2>
        <form onSubmit={handleSubmit} className={styles.form}>
          {!isLogin && (
            <input
              type="text"
              placeholder="Nombre de usuario"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className={styles.input}
            />
          )}
          <input
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className={styles.input}
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className={styles.input}
          />
          <button type="submit" className={styles.button}>
            {isLogin ? 'Iniciar sesión' : 'Registrarse'}
          </button>
        </form>
        {error && <p className={styles.error}>{error}</p>}
        <button onClick={() => setIsLogin(!isLogin)} className={styles.switchButton}>
          {isLogin ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión'}
        </button>
      </div>
    </div>
  );
};

export default LoginRegister;