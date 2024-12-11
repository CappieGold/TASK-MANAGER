import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './RegisterPage.css';

const RegisterPage = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(''); // Ajout du state pour l'erreur
  const navigate = useNavigate();

  const handleRegister = async () => {
    setError('');
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password })
      });

      const data = await response.json();

      if (response.ok) {
        console.log('User registered:', data);
        navigate('/login');
      } else {
        // Affichez le message d'erreur du backend s'il y en a un
        // data.errors est utilisé par express-validator, data.error par vos erreurs custom
        if (data.errors && data.errors.length > 0) {
          setError(data.errors.map(err => err.msg).join(' | '));
        } else {
          setError(data.error || 'Une erreur est survenue.');
        }
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Une erreur interne est survenue. Veuillez réessayer plus tard.');
    }
  };

  return (
    <div className="register-container">
      <div className="register-box">
        <h1>Créer un compte</h1>
        {error && <div style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>} {/* Affiche l'erreur en rouge */}
        <input
          type="text"
          placeholder="Nom d'utilisateur"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button onClick={handleRegister}>Créer un compte</button>
      </div>
    </div>
  );
};

export default RegisterPage;
