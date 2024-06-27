// src/pages/TaskPage.jsx

import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";

function TaskPage() {
  const [tasks, setTasks] = useState([]);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDescription, setNewTaskDescription] = useState("");
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

    if (token) {
      fetchTasks();
    }
  }, [token]);

  const handleCreateTask = async () => {
    try {
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ title: newTaskTitle, description: newTaskDescription })
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

  return (
    <div>
      <h1>Tâches</h1>
      <input
        type="text"
        placeholder="Titre de la tâche"
        value={newTaskTitle}
        onChange={(e) => setNewTaskTitle(e.target.value)}
      />
      <input
        type="text"
        placeholder="Description de la tâche"
        value={newTaskDescription}
        onChange={(e) => setNewTaskDescription(e.target.value)}
      />
      <button onClick={handleCreateTask}>Créer une tâche</button>
      <ul>
        {tasks.map(task => (
          <li key={task.id}>
            {task.title} - {task.description}
            <button onClick={() => handleDeleteTask(task.id)}>Supprimer</button>
            {/* Ajoutez un bouton de modification si nécessaire */}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default TaskPage;
