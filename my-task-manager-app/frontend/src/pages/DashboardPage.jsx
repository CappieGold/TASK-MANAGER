import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Pie } from "react-chartjs-2";
import { Container, Row, Col } from "react-bootstrap";
import 'chart.js/auto';
import './DashboardPage.css'; // Importer le fichier CSS

function DashboardPage() {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const { token } = useContext(AuthContext);

  useEffect(() => {
    const fetchTasks = async () => {
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
          setTasks(data);
        } else {
          console.error("Échec de la récupération des tâches", response.status, response.statusText);
        }
      } catch (error) {
        console.error("Erreur:", error);
      }
    };

    const fetchProjects = async () => {
      try {
        const response = await fetch("/api/projects", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });

        if (response.ok) {
          const data = await response.json();
          setProjects(data);
        } else {
          console.error("Échec de la récupération des projets", response.status, response.statusText);
        }
      } catch (error) {
        console.error("Erreur:", error);
      }
    };

    if (token) {
      fetchTasks();
      fetchProjects();
    }
  }, [token]);

  const tasksWithoutProject = tasks.filter(task => !task.projectId);

  const taskStatusCounts = tasksWithoutProject.reduce((counts, task) => {
    counts[task.status] = (counts[task.status] || 0) + 1;
    return counts;
  }, {});

  const projectTaskStatusCounts = projects.reduce((counts, project) => {
    const projectTaskCounts = tasks.reduce((projCounts, task) => {
      if (task.projectId === project.id) {
        projCounts[task.status] = (projCounts[task.status] || 0) + 1;
      }
      return projCounts;
    }, {});

    counts[project.name] = projectTaskCounts;
    return counts;
  }, {});

  const taskStatusData = {
    labels: ["Pas commencé", "En cours", "Fini"],
    datasets: [
      {
        data: [
          taskStatusCounts.pending || 0,
          taskStatusCounts.in_progress || 0,
          taskStatusCounts.completed || 0,
        ],
        backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56"],
      },
    ],
  };

  const renderProjectTaskStatusCharts = () => {
    const projectCharts = Object.keys(projectTaskStatusCounts).map((projectName, index) => {
      const projectData = projectTaskStatusCounts[projectName];
      const projectTaskStatusData = {
        labels: ["Pas commencé", "En cours", "Fini"],
        datasets: [
          {
            data: [
              projectData.pending || 0,
              projectData.in_progress || 0,
              projectData.completed || 0,
            ],
            backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56"],
          },
        ],
      };

      return (
        <Col md={6} key={index} className="mb-4 pie-chart-container">
          <h4>{projectName}</h4>
          <Pie
            data={projectTaskStatusData}
            width={500}
            height={500}
            options={{
              plugins: {
                legend: {
                  labels: {
                    color: 'white', // Changer la couleur des labels de légende en blanc
                    font: {
                      size: 14
                    }
                  }
                }
              }
            }}
          />
        </Col>
      );
    });

    const rows = [];
    for (let i = 0; i < projectCharts.length; i += 2) {
      rows.push(
        <Row key={i}>
          {projectCharts[i]}
          {projectCharts[i + 1]}
        </Row>
      );
    }
    return rows;
  };

  return (
    <Container>
      <h1 className="text-center">Dashboard</h1>
      <Row className="justify-content-center">
        <Col md={6} className="text-center">
          <h3>Statistiques des tâches</h3>
          <Pie
            data={taskStatusData}
            width={500}
            height={500}
            options={{
              plugins: {
                legend: {
                  labels: {
                    color: 'white', // Changer la couleur des labels de légende en blanc
                    font: {
                      size: 14
                    }
                  }
                }
              }
            }}
          />
        </Col>
      </Row>
      <Row className="justify-content-center mt-5">
        <Col md={6} className="text-center">
          <h3>Statistiques des projets</h3>
        </Col>
      </Row>
      {renderProjectTaskStatusCharts()}
    </Container>
  );
}

export default DashboardPage;
