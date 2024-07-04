// src/pages/DashboardPage.jsx

import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Pie } from "react-chartjs-2";
import { Container, Row, Col } from "react-bootstrap";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const DashboardPage = () => {
  const { token } = useContext(AuthContext);
  const [taskStats, setTaskStats] = useState({ pending: 0, inProgress: 0, completed: 0 });
  const [projectStats, setProjectStats] = useState([]);

  useEffect(() => {
    const fetchTaskStats = async () => {
      try {
        const response = await fetch("/api/tasks", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });

        if (response.ok) {
          const data = await response.json();
          const pending = data.filter(task => task.status === "pending").length;
          const inProgress = data.filter(task => task.status === "in_progress").length;
          const completed = data.filter(task => task.status === "completed").length;
          setTaskStats({ pending, inProgress, completed });
        } else {
          console.error("Échec de la récupération des tâches", response.status, response.statusText);
        }
      } catch (error) {
        console.error("Erreur:", error);
      }
    };

    const fetchProjectStats = async () => {
      try {
        const response = await fetch("/api/projects", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });

        if (response.ok) {
          const projects = await response.json();
          const stats = projects.map(project => {
            const pending = project.Tasks.filter(task => task.status === "pending").length;
            const inProgress = project.Tasks.filter(task => task.status === "in_progress").length;
            const completed = project.Tasks.filter(task => task.status === "completed").length;
            return {
              projectName: project.name,
              pending,
              inProgress,
              completed
            };
          });
          setProjectStats(stats);
        } else {
          console.error("Échec de la récupération des projets", response.status, response.statusText);
        }
      } catch (error) {
        console.error("Erreur:", error);
      }
    };

    if (token) {
      fetchTaskStats();
      fetchProjectStats();
    }
  }, [token]);

  const taskData = {
    labels: ["Pas commencé", "En cours", "Fini"],
    datasets: [{
      data: [taskStats.pending, taskStats.inProgress, taskStats.completed],
      backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56"],
    }],
  };

  return (
    <Container>
      <h1>Dashboard</h1>
      <Row>
        <Col md={6}>
          <h3>Statistiques des tâches</h3>
          <Pie data={taskData} />
        </Col>
        <Col md={6}>
          <h3>Statistiques des projets</h3>
          {projectStats.map((project, index) => (
            <div key={index}>
              <h4>{project.projectName}</h4>
              <Pie
                data={{
                  labels: ["Pas commencé", "En cours", "Fini"],
                  datasets: [{
                    data: [project.pending, project.inProgress, project.completed],
                    backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56"],
                  }],
                }}
              />
            </div>
          ))}
        </Col>
      </Row>
    </Container>
  );
};

export default DashboardPage;
