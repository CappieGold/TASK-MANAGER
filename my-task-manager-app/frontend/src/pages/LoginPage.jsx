import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useContext(AuthContext);

  const handleLogin = async () => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      if (response.ok) {
        const data = await response.json();
        login(data.token);
        console.log('Utilisateur connecté:', data);
      } else {
        console.error('Échec de la connexion', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  return (
    <div>
      <h1>Connexion</h1>
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
  );
};

export default LoginPage;
