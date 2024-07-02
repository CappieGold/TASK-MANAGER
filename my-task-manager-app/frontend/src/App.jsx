import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import TaskPage from "./pages/TaskPage";
import ProjectPage from "./pages/ProjectPage";
import DashboardPage from "./pages/DashboardPage";
import RegisterPage from "./pages/RegisterPage"; // Importer la page d'inscription
import Navbar from "./components/Navbar";
import 'bootstrap/dist/css/bootstrap.min.css';


function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} /> {/* Ajouter la route d'inscription */}
          <Route path="/tasks" element={<TaskPage />} />
          <Route path="/projects" element={<ProjectPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
