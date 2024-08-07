import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Container, Row, Col, Table, Form, Button, ListGroup, ListGroupItem } from 'react-bootstrap';
import './TaskPage.css'; // Assurez-vous que le CSS est bien importé

const TaskPage = () => {
  const [tasks, setTasks] = useState([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [newCommentContent, setNewCommentContent] = useState('');
  const [selectedTask, setSelectedTask] = useState(null);
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
            data.filter(task => !task.projectId).map(async (task) => {
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
        if (selectedTask && selectedTask.id === id) {
          setSelectedTask(null);
        }
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
        if (selectedTask && selectedTask.id === taskId) {
          setSelectedTask({
            ...selectedTask,
            comments: [...(selectedTask.comments || []), comment],
          });
        }
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
        if (selectedTask && selectedTask.id === taskId) {
          setSelectedTask({
            ...selectedTask,
            comments: selectedTask.comments.filter((comment) => comment.id !== commentId),
          });
        }
      } else {
        console.error('Failed to delete comment', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error:', error);
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
          task.id === taskId ? { ...updatedTask, comments: task.comments } : task
        );
        setTasks(updatedTasks);
        if (selectedTask && selectedTask.id === taskId) {
          setSelectedTask({
            ...updatedTask,
            comments: selectedTask.comments,
          });
        }
      } else {
        console.error('Failed to update status', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleSelectTask = (task) => {
    setSelectedTask(task);
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
    <Container className="task-container">
      <h1 className="task-title">Tâches</h1>
      <div className="task-form">
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
      </div>
      <Table striped bordered hover className="mt-4 task-table">
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
            <tr key={task.id} onClick={() => handleSelectTask(task)} className={getStatusClassName(task.status)}>
              <td>{task.title}</td>
              <td className="task-description">{task.description}</td>
              <td>
                <Form.Control 
                  as="select" 
                  className="task-status-select"
                  value={task.status} 
                  onChange={(e) => handleChangeStatus(task.id, e.target.value)}
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
        <div className="comment-section">
          <h3>Commentaires pour la tâche: {selectedTask.title}</h3>
          <ListGroup>
            {selectedTask.comments && selectedTask.comments.map(comment => (
              <ListGroupItem key={comment.id}>
                {comment.content}
                <Button variant="danger" size="sm" className="comment-button" onClick={() => handleDeleteComment(selectedTask.id, comment.id)}>Supprimer</Button>
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
    </Container>
  );
};

export default TaskPage;
