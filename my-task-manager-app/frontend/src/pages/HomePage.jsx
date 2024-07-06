import React from 'react';
import './HomePage.css'; // Assurez-vous que le CSS est bien importé

const HomePage = () => {
  return (
    <div className="home-container">
      <h1>Bienvenue sur le gestionnaire de tâches</h1>
      <p>Utilisez les liens de navigation pour accéder aux différentes sections.</p>
      <div className="home-cards">
        <div className="home-card">
          <h2>Tâches</h2>
          <p>Gérez vos tâches, ajoutez des commentaires et suivez leur progression.</p>
        </div>
        <div className="home-card">
          <h2>Projets</h2>
          <p>Créez et gérez vos projets, assignez des tâches et collaborez avec votre équipe.</p>
        </div>
        <div className="home-card">
          <h2>Dashboard</h2>
          <p>Visualisez les statistiques de vos tâches et projets pour un suivi efficace.</p>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
