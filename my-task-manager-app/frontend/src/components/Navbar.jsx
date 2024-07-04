import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
  const { token, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav>
      <ul>
        <li><Link to="/">Accueil</Link></li>
        {!token && <li><Link to="/login">Connexion</Link></li>}
        {token && (
          <>
            <li><Link to="/tasks">Tâches</Link></li>
            <li><Link to="/projects">Projets</Link></li>
            <li><Link to="/dashboard">Dashboard</Link></li>
            <li><Link to="/account">Compte</Link></li>
            <li><button onClick={handleLogout}>Déconnexion</button></li>
          </>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;
