// src/pages/TaskPage.jsx

import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const TaskPage = () => {
  const [tasks, setTasks] = useState([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [newCommentContent, setNewCommentContent] = useState('');
  const { token } = useContext(AuthContext);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await fetch('/api/tasks', {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          const tasksWithComments = await Promise.all(
            data.map(async (task) => {
              const commentsResponse = await fetch(`/api/comments/${task.id}`, {
                method: 'GET',
                headers: {
                  Authorization: `Bearer ${token}`,
                  'Content-Type': 'application/json',
                },
              });
              if (commentsResponse.ok) {
                const comments = await commentsResponse.json();
                return { ...task, comments };
              }
              return { ...task, comments: [] };
            })
          );
          setTasks(tasksWithComments);
        } else {
          console.error('Failed to fetch tasks', response.status, response.statusText);
        }
      } catch (error) {
        console.error('Error:', error);
      }
    };

    if (token) {
      fetchTasks();
    }
  }, [token]);

  const handleCreateTask = async () => {
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: newTaskTitle, description: newTaskDescription }),
      });

      if (response.ok) {
        const task = await response.json();
        setTasks([...tasks, { ...task, comments: [] }]);
        setNewTaskTitle('');
        setNewTaskDescription('');
      } else {
        console.error('Failed to create task', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleDeleteTask = async (id) => {
    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setTasks(tasks.filter((task) => task.id !== id));
      } else {
        console.error('Failed to delete task', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleCreateComment = async (taskId) => {
    try {
      const response = await fetch(`/api/comments`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: newCommentContent, taskId }),
      });

      if (response.ok) {
        const comment = await response.json();
        const updatedTasks = tasks.map((task) => {
          if (task.id === taskId) {
            return { ...task, comments: [...(task.comments || []), comment] };
          }
          return task;
        });
        setTasks(updatedTasks);
        setNewCommentContent('');
      } else {
        console.error('Failed to create comment', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleDeleteComment = async (taskId, commentId) => {
    try {
      const response = await fetch(`/api/comments/${commentId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const updatedTasks = tasks.map((task) => {
          if (task.id === taskId) {
            return {
              ...task,
              comments: task.comments.filter((comment) => comment.id !== commentId),
            };
          }
          return task;
        });
        setTasks(updatedTasks);
      } else {
        console.error('Failed to delete comment', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="container">
      <h1>Tâches</h1>
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
        {tasks.map((task) => (
          <li key={task.id} className="list-group-item d-flex justify-content-between align-items-center">
            <div>
              <h5>{task.title}</h5>
              <p>{task.description}</p>
              {task.comments && (
                <ul>
                  {task.comments.map((comment) => (
                    <li key={comment.id}>
                      {comment.content}
                      <button onClick={() => handleDeleteComment(task.id, comment.id)}>Supprimer</button>
                    </li>
                  ))}
                </ul>
              )}
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
  );
};

export default TaskPage;
