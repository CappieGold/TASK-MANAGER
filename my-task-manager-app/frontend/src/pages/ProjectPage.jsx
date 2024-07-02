import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Container, Row, Col, Card, Form, Button, ListGroup, ListGroupItem } from 'react-bootstrap';

function ProjectPage() {
  const [projects, setProjects] = useState([]);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectDescription, setNewProjectDescription] = useState("");
  const [selectedProject, setSelectedProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDescription, setNewTaskDescription] = useState("");
  const [newCommentContent, setNewCommentContent] = useState("");
  const [collaborators, setCollaborators] = useState([]);
  const { token } = useContext(AuthContext);

  useEffect(() => {
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
      fetchProjects();
    }
  }, [token]);

  const handleCreateProject = async () => {
    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ name: newProjectName, description: newProjectDescription })
      });

      if (response.ok) {
        const project = await response.json();
        setProjects([...projects, project]);
        setNewProjectName("");
        setNewProjectDescription("");
      } else {
        console.error("Échec de la création du projet", response.status, response.statusText);
      }
    } catch (error) {
      console.error("Erreur:", error);
    }
  };

  const handleDeleteProject = async (id) => {
    try {
      const response = await fetch(`/api/projects/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (response.ok) {
        setProjects(projects.filter(project => project.id !== id));
        setSelectedProject(null);
        setTasks([]);
        setCollaborators([]);
      } else {
        console.error("Échec de la suppression du projet", response.status, response.statusText);
      }
    } catch (error) {
      console.error("Erreur:", error);
    }
  };

  const handleSelectProject = async (projectId) => {
    setSelectedProject(projectId);
    try {
      const response = await fetch(`/api/tasks/project/${projectId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (response.ok) {
        const data = await response.json();
        const tasksWithComments = await Promise.all(data.map(async task => {
          const commentsResponse = await fetch(`/api/comments/${task.id}`, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json"
            }
          });
          if (commentsResponse.ok) {
            const comments = await commentsResponse.json();
            return { ...task, comments };
          } else {
            console.error("Échec de la récupération des commentaires", commentsResponse.status, commentsResponse.statusText);
            return task;
          }
        }));
        setTasks(tasksWithComments);

        const collaboratorsResponse = await fetch(`/api/projects/${projectId}/collaborators`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });

        if (collaboratorsResponse.ok) {
          const collaboratorsData = await collaboratorsResponse.json();
          setCollaborators(collaboratorsData);
        } else {
          console.error("Échec de la récupération des collaborateurs", collaboratorsResponse.status, collaboratorsResponse.statusText);
        }
      } else {
        console.error("Échec de la récupération des tâches", response.status, response.statusText);
      }
    } catch (error) {
      console.error("Erreur:", error);
    }
  };

  const handleCreateTask = async () => {
    try {
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ title: newTaskTitle, description: newTaskDescription, projectId: selectedProject })
      });

      if (response.ok) {
        const task = await response.json();
        setTasks([...tasks, task]);
        setNewTaskTitle("");
        setNewTaskDescription("");
      } else {
        console.error("Échec de la création de la tâche", response.status, response.statusText);
      }
    } catch (error) {
      console.error("Erreur:", error);
    }
  };

  const handleDeleteTask = async (id) => {
    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (response.ok) {
        setTasks(tasks.filter(task => task.id !== id));
      } else {
        console.error("Échec de la suppression de la tâche", response.status, response.statusText);
      }
    } catch (error) {
      console.error("Erreur:", error);
    }
  };

  const handleCreateComment = async (taskId) => {
    try {
      const response = await fetch(`/api/comments`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ content: newCommentContent, taskId })
      });

      if (response.ok) {
        setNewCommentContent("");
        fetchCommentsForTask(taskId); // Re-fetch comments after adding a new one
      } else {
        console.error("Échec de la création du commentaire", response.status, response.statusText);
      }
    } catch (error) {
      console.error("Erreur:", error);
    }
  };

  const fetchCommentsForTask = async (taskId) => {
    try {
      const response = await fetch(`/api/comments/${taskId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (response.ok) {
        const comments = await response.json();
        setTasks((prevTasks) => {
          const updatedTasks = prevTasks.map(task => {
            if (task.id === taskId) {
              return { ...task, comments };
            }
            return task;
          });
          return updatedTasks;
        });
      } else {
        console.error("Échec de la récupération des commentaires", response.status, response.statusText);
      }
    } catch (error) {
      console.error("Erreur:", error);
    }
  };

  const handleDeleteComment = async (commentId, taskId) => {
    try {
      const response = await fetch(`/api/comments/${commentId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (response.ok) {
        fetchCommentsForTask(taskId);
      } else {
        console.error("Échec de la suppression du commentaire", response.status, response.statusText);
      }
    } catch (error) {
      console.error("Erreur:", error);
    }
  };

  const handleChangeStatus = async (taskId, status) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        const updatedTask = await response.json();
        const updatedTasks = tasks.map((task) =>
          task.id === taskId ? { ...task, status: updatedTask.status } : task
        );
        setTasks(updatedTasks);
      } else {
        console.error('Failed to update status', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <Container>
      <h1>Projets</h1>
      <Form.Group controlId="newProjectName" className="mb-3">
        <Form.Control
          type="text"
          placeholder="Nom du projet"
          value={newProjectName}
          onChange={(e) => setNewProjectName(e.target.value)}
        />
      </Form.Group>
      <Form.Group controlId="newProjectDescription" className="mb-3">
        <Form.Control
          type="text"
          placeholder="Description du projet"
          value={newProjectDescription}
          onChange={(e) => setNewProjectDescription(e.target.value)}
        />
      </Form.Group>
      <Button variant="primary" onClick={handleCreateProject}>Créer un projet</Button>
      <ListGroup className="mt-4">
        {projects.map(project => (
          <ProjectItem
            key={project.id}
            project={project}
            onSelectProject={handleSelectProject}
            onDeleteProject={handleDeleteProject}
            token={token}
          />
        ))}
      </ListGroup>

      {selectedProject && (
        <div className="mt-5">
          <h2>Tâches pour le projet {projects.find(proj => proj.id === selectedProject)?.name}</h2>
          <Row>
            <Col md={8}>
              <Form.Group controlId="newTaskTitle" className="mb-3">
                <Form.Control
                  type="text"
                  placeholder="Titre de la tâche"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                />
              </Form.Group>
              <Form.Group controlId="newTaskDescription" className="mb-3">
                <Form.Control
                  type="text"
                  placeholder="Description de la tâche"
                  value={newTaskDescription}
                  onChange={(e) => setNewTaskDescription(e.target.value)}
                />
              </Form.Group>
              <Button variant="primary" onClick={handleCreateTask}>Créer une tâche</Button>
              <ListGroup className="mt-4">
                {tasks.map(task => (
                  <ListGroupItem key={task.id} className="d-flex justify-content-between align-items-center">
                    <div>
                      <h5>{task.title}</h5>
                      <p>{task.description}</p>
                      <p>Status: 
                        <Form.Control 
                          as="select" 
                          value={task.status} 
                          onChange={(e) => handleChangeStatus(task.id, e.target.value)}
                          className="d-inline-block w-auto"
                        >
                          <option value="pending">Pending</option>
                          <option value="in_progress">In Progress</option>
                          <option value="completed">Completed</option>
                        </Form.Control>
                      </p>
                      <ul>
                        {task.comments && task.comments.map(comment => (
                          <li key={comment.id} className="d-flex justify-content-between">
                            {comment.content}
                            <Button variant="danger" size="sm" onClick={() => handleDeleteComment(comment.id, task.id)}>Supprimer</Button>
                          </li>
                        ))}
                      </ul>
                      <Form.Group controlId="newCommentContent" className="mb-3">
                        <Form.Control
                          type="text"
                          placeholder="Ajouter un commentaire"
                          value={newCommentContent}
                          onChange={(e) => setNewCommentContent(e.target.value)}
                        />
                      </Form.Group>
                      <Button variant="primary" onClick={() => handleCreateComment(task.id)}>Ajouter un commentaire</Button>
                    </div>
                    <Button variant="danger" onClick={() => handleDeleteTask(task.id)}>Supprimer</Button>
                  </ListGroupItem>
                ))}
              </ListGroup>
            </Col>
            <Col md={4}>
              <h3>Collaborateurs</h3>
              <ListGroup>
                {collaborators.map(collaborator => (
                  <ListGroupItem key={collaborator.id}>
                    {collaborator.username} ({collaborator.email})
                  </ListGroupItem>
                ))}
              </ListGroup>
            </Col>
          </Row>
        </div>
      )}
    </Container>
  );
}

const ProjectItem = ({ project, onSelectProject, onDeleteProject, token }) => {
  const [collaboratorEmail, setCollaboratorEmail] = useState("");

  const handleAddCollaborator = async () => {
    try {
      const response = await fetch(`/api/projects/${project.id}/collaborators`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email: collaboratorEmail })
      });

      if (response.ok) {
        setCollaboratorEmail("");
        alert('Collaborator added successfully');
      } else {
        console.error("Échec de l'ajout du collaborateur", response.status, response.statusText);
      }
    } catch (error) {
      console.error("Erreur:", error);
    }
  };

  return (
    <ListGroupItem className="d-flex justify-content-between align-items-center">
      <div onClick={() => onSelectProject(project.id)}>
        <h5>{project.name}</h5>
        <p>{project.description}</p>
      </div>
      <Button variant="danger" onClick={() => onDeleteProject(project.id)}>Supprimer</Button>
      <div>
        <Form.Group controlId="collaboratorEmail">
          <Form.Control
            type="email"
            placeholder="Email du collaborateur"
            value={collaboratorEmail}
            onChange={(e) => setCollaboratorEmail(e.target.value)}
          />
        </Form.Group>
        <Button variant="secondary" onClick={handleAddCollaborator}>Ajouter un collaborateur</Button>
      </div>
    </ListGroupItem>
  );
};

export default ProjectPage;
