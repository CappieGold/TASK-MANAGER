import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import './LoginPage.css';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(''); // Ajout du state pour l'erreur
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogin = async () => {
    setError(''); // Réinitialise l'erreur avant la tentative
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok) {
        login(data.token, data.user);
        console.log('Utilisateur connecté:', data);
        navigate('/');
      } else {
        // Si la réponse n'est pas OK, on affiche le message d'erreur retourné par le backend
        setError(data.error || 'Une erreur est survenue.'); 
      }
    } catch (error) {
      console.error('Erreur:', error);
      setError('Une erreur interne est survenue. Veuillez réessayer plus tard.');
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h1>Connexion</h1>
        {error && <div style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>} {/* Affiche l'erreur en rouge */}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
        />
        <input
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
        />
        <button onClick={handleLogin}>Se connecter</button>
        <p>
          Pas encore de compte ? <Link to="/register">Créer un compte</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
