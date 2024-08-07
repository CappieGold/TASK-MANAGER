import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Container, Row, Col, Card, Form, Button, ListGroup, ListGroupItem, Table } from 'react-bootstrap';
import './ProjectPage.css'; // Importer le fichier CSS

function ProjectPage() {
  const [projects, setProjects] = useState([]);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectDescription, setNewProjectDescription] = useState("");
  const [selectedProject, setSelectedProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDescription, setNewTaskDescription] = useState("");
  const [newCommentContent, setNewCommentContent] = useState("");
  const [collaborators, setCollaborators] = useState([]);
  const [collaboratorEmail, setCollaboratorEmail] = useState("");
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
        setSelectedTask(null);
      } else {
        console.error("Échec de la suppression du projet", response.status, response.statusText);
      }
    } catch (error) {
      console.error("Erreur:", error);
    }
  };

  const handleSelectProject = async (projectId) => {
    setSelectedProject(projectId);
    setSelectedTask(null);
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
        await fetchCollaborators(projectId);
      } else {
        console.error("Échec de la récupération des tâches", response.status, response.statusText);
      }
    } catch (error) {
      console.error("Erreur:", error);
    }
  };

  const fetchCollaborators = async (projectId) => {
    try {
      const response = await fetch(`/api/projects/${projectId}/collaborators`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (response.ok) {
        const collaboratorsData = await response.json();
        setCollaborators(collaboratorsData);
      } else {
        console.error("Échec de la récupération des collaborateurs", response.status, response.statusText);
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
        if (selectedTask && selectedTask.id === id) {
          setSelectedTask(null);
        }
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
        const comment = await response.json();
        setTasks(tasks.map(task =>
          task.id === taskId ? { ...task, comments: [...(task.comments || []), comment] } : task
        ));
        setNewCommentContent("");
        setSelectedTask({ ...selectedTask, comments: [...(selectedTask.comments || []), comment] });
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
        setTasks(tasks.map(task =>
          task.id === taskId ? { ...task, comments } : task
        ));
        setSelectedTask(tasks.find(task => task.id === taskId));
      } else {
        console.error("Échec de la récupération des commentaires", response.status, response.statusText);
      }
    } catch (error) {
      console.error("Erreur:", error);
    }
  };

  const handleDeleteComment = async (commentId, taskId) => {
    console.log(`Trying to delete comment with id: ${commentId} for task: ${taskId}`);
    try {
      const response = await fetch(`/api/comments/${commentId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (response.ok) {
        console.log(`Comment with id: ${commentId} deleted successfully`);
        setTasks(tasks.map(task =>
          task.id === taskId ? { ...task, comments: task.comments.filter(comment => comment.id !== commentId) } : task
        ));
        setSelectedTask({
          ...selectedTask,
          comments: selectedTask.comments.filter(comment => comment.id !== commentId)
        });
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
        setTasks((prevTasks) =>
          prevTasks.map((task) =>
            task.id === taskId ? { ...task, status: updatedTask.status } : task
          )
        );
      } else {
        console.error('Failed to update status', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleSelectTask = (task) => {
    setSelectedTask(task);
    fetchCommentsForTask(task.id);
  };

  const handleAddCollaborator = async (projectId) => {
    try {
      const response = await fetch(`/api/projects/${projectId}/collaborators`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email: collaboratorEmail })
      });

      if (response.ok) {
        await fetchCollaborators(projectId); // Fetch updated collaborators
        setCollaboratorEmail("");
      } else {
        console.error("Échec de l'ajout du collaborateur", response.status, response.statusText);
      }
    } catch (error) {
      console.error("Erreur:", error);
    }
  };

  const getStatusClassName = (status) => {
    switch (status) {
      case 'pending':
        return 'status-pending';
      case 'in_progress':
        return 'status-in_progress';
      case 'completed':
        return 'status-completed';
      default:
        return '';
    }
  };

  return (
    <Container>
      <div className="project-form">
        <Card className="project-form-card">
          <Card.Body>
            <h1 className="project-title">Projets</h1>
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
          </Card.Body>
        </Card>
      </div>
      <Row className="mt-4 project-list">
        {projects.map(project => (
          <Col key={project.id} md={4} className="mb-4 project-card">
            <Card className="project-card">
              <Card.Body className="project-card-body" onClick={() => handleSelectProject(project.id)}>
                <Card.Title>{project.name}</Card.Title>
                <Card.Text>{project.description}</Card.Text>
              </Card.Body>
              <Card.Footer className="project-card-footer">
                <Button variant="danger" onClick={() => handleDeleteProject(project.id)}>Supprimer</Button>
              </Card.Footer>
            </Card>
          </Col>
        ))}
      </Row>

      {selectedProject && (
        <div className="mt-5 project-container">
          <h2>Tâches pour le projet {projects.find(proj => proj.id === selectedProject)?.name}</h2>
          <Row>
            <Col md={12}>
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
            </Col>
          </Row>
          <Row>
            <Col md={12}>
              <Table striped bordered hover className="mt-4 project-table">
                <thead>
                  <tr>
                    <th>Titre</th>
                    <th>Description</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.map(task => (
                    <tr key={task.id} onClick={() => handleSelectTask(task)} className={getStatusClassName(task.status)} data-task-id={task.id}>
                      <td>{task.title}</td>
                      <td className="task-description">{task.description}</td>
                      <td>
                        <Form.Control 
                          as="select" 
                          value={task.status} 
                          onChange={(e) => handleChangeStatus(task.id, e.target.value)}
                          className="task-status-select"
                        >
                          <option value="pending">Pending</option>
                          <option value="in_progress">In Progress</option>
                          <option value="completed">Completed</option>
                        </Form.Control>
                      </td>
                      <td className="task-actions">
                        <Button variant="danger" onClick={(e) => { e.stopPropagation(); handleDeleteTask(task.id); }}>Supprimer</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
              {selectedTask && (
                <div className="mt-4 comment-section">
                  <h3>Commentaires pour la tâche: {selectedTask.title}</h3>
                  <ListGroup>
                    {selectedTask.comments && selectedTask.comments.map(comment => (
                      <ListGroupItem key={comment.id}>
                        {comment.content}
                        <Button variant="danger" size="sm" className="comment-button" onClick={(e) => { e.stopPropagation(); handleDeleteComment(comment.id, selectedTask.id); }}>Supprimer</Button>
                      </ListGroupItem>
                    ))}
                  </ListGroup>
                  <Form.Group controlId="newCommentContent" className="mt-3">
                    <Form.Control
                      type="text"
                      placeholder="Ajouter un commentaire"
                      value={newCommentContent}
                      onChange={(e) => setNewCommentContent(e.target.value)}
                    />
                  </Form.Group>
                  <Button variant="primary" onClick={() => handleCreateComment(selectedTask.id)}>Ajouter un commentaire</Button>
                </div>
              )}
            </Col>
          </Row>
          <Row>
            <Col md={12}>
              <h3>Collaborateurs</h3>
              <ListGroup>
                {collaborators.map(collaborator => (
                  <ListGroupItem key={collaborator.id}>
                    {collaborator.username} ({collaborator.email})
                    {collaborator.isCreator && <strong> (Créateur)</strong>}
                  </ListGroupItem>
                ))}
              </ListGroup>
              <Form.Group controlId="collaboratorEmail" className="mt-3">
                <Form.Control
                  type="email"
                  placeholder="Email du collaborateur"
                  value={collaboratorEmail}
                  onChange={(e) => setCollaboratorEmail(e.target.value)}
                />
              </Form.Group>
              <Button variant="secondary" onClick={() => handleAddCollaborator(selectedProject)}>Ajouter un collaborateur</Button>
            </Col>
          </Row>
        </div>
      )}
    </Container>
  );
}

export default ProjectPage;
