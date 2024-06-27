import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";

function ProjectPage() {
  const [projects, setProjects] = useState([]);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectDescription, setNewProjectDescription] = useState("");
  const [selectedProject, setSelectedProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDescription, setNewTaskDescription] = useState("");
  const [newCommentContent, setNewCommentContent] = useState("");
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
        setTasks(data);
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
    <div className="container">
      <h1>Projets</h1>
      <div className="mb-3">
        <input
          type="text"
          className="form-control"
          placeholder="Nom du projet"
          value={newProjectName}
          onChange={(e) => setNewProjectName(e.target.value)}
        />
      </div>
      <div className="mb-3">
        <input
          type="text"
          className="form-control"
          placeholder="Description du projet"
          value={newProjectDescription}
          onChange={(e) => setNewProjectDescription(e.target.value)}
        />
      </div>
      <button className="btn btn-primary" onClick={handleCreateProject}>Créer un projet</button>
      <ul className="list-group mt-4">
        {projects.map(project => (
          <li key={project.id} className="list-group-item d-flex justify-content-between align-items-center">
            <div onClick={() => handleSelectProject(project.id)}>
              <h5>{project.name}</h5>
              <p>{project.description}</p>
            </div>
            <button className="btn btn-danger" onClick={() => handleDeleteProject(project.id)}>Supprimer</button>
            {/* Ajouter un bouton pour ajouter un collaborateur */}
            <div>
              <input
                type="email"
                className="form-control"
                placeholder="Email du collaborateur"
                value={collaboratorEmail}
                onChange={(e) => setCollaboratorEmail(e.target.value)}
              />
              <button className="btn btn-secondary" onClick={() => handleAddCollaborator(project.id)}>Ajouter un collaborateur</button>
            </div>
          </li>
        ))}
      </ul>

      {selectedProject && (
        <div className="mt-5">
          <h2>Tâches pour le projet {selectedProject}</h2>
          <div className="mb-3">
            <input
              type="text"
              className="form-control"
              placeholder="Titre de la tâche"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
            />
          </div>
          <div className="mb-3">
            <input
              type="text"
              className="form-control"
              placeholder="Description de la tâche"
              value={newTaskDescription}
              onChange={(e) => setNewTaskDescription(e.target.value)}
            />
          </div>
          <button className="btn btn-primary" onClick={handleCreateTask}>Créer une tâche</button>
          <ul className="list-group mt-4">
            {tasks.map(task => (
              <li key={task.id} className="list-group-item d-flex justify-content-between align-items-center">
                <div>
                  <h5>{task.title}</h5>
                  <p>{task.description}</p>
                  {/* Afficher les commentaires */}
                  <ul>
                    {task.comments && task.comments.map(comment => (
                      <li key={comment.id} className="d-flex justify-content-between">
                        {comment.content}
                        <button className="btn btn-danger btn-sm" onClick={() => handleDeleteComment(comment.id, task.id)}>Supprimer</button>
                      </li>
                    ))}
                  </ul>
                  {/* Formulaire pour ajouter des commentaires */}
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Ajouter un commentaire"
                    value={newCommentContent}
                    onChange={(e) => setNewCommentContent(e.target.value)}
                  />
                  <button className="btn btn-primary" onClick={() => handleCreateComment(task.id)}>Ajouter un commentaire</button>
                </div>
                <button className="btn btn-danger" onClick={() => handleDeleteTask(task.id)}>Supprimer</button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default ProjectPage;
