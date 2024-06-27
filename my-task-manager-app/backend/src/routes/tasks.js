// routes/tasks.js

import express from 'express';
import Task from '../models/Task.js';
import Comment from '../models/Comment.js';
import User from '../models/User.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Middleware pour vérifier le token JWT
router.use(verifyToken);

// Créer une nouvelle tâche
router.post('/', async (req, res) => {
  const { title, description, projectId } = req.body;
  try {
    const task = await Task.create({ title, description, projectId, userId: req.userId });
    const io = req.app.get('io');
    io.emit('taskCreated', task);
    res.status(201).json(task);
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ error: error.message });
  }
});

// Récupérer toutes les tâches de l'utilisateur pour un projet spécifique
router.get('/project/:projectId', async (req, res) => {
  const { projectId } = req.params;
  try {
    const tasks = await Task.findAll({ where: { projectId, userId: req.userId } });
    res.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ error: error.message });
  }
});

// Mettre à jour une tâche
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { title, description, status, projectId } = req.body;
  try {
    const task = await Task.findByPk(id);
    if (!task || task.userId !== req.userId) {
      return res.status(404).json({ error: 'Task not found' });
    }
    task.title = title;
    task.description = description;
    task.status = status;
    task.projectId = projectId;
    await task.save();
    const io = req.app.get('io');
    io.emit('taskUpdated', task);
    res.json(task);
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ error: error.message });
  }
});

// Supprimer une tâche
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const task = await Task.findByPk(id);
    if (!task || task.userId !== req.userId) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Supprimer les commentaires associés avant de supprimer la tâche
    await Comment.destroy({ where: { taskId: id } });

    await task.destroy();
    const io = req.app.get('io');
    io.emit('taskDeleted', { id });
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ error: error.message });
  }
});

// Route pour ajouter un collaborateur à une tâche
router.post('/:taskId/collaborators', async (req, res) => {
  const { taskId } = req.params;
  const { email } = req.body;
  try {
    const task = await Task.findByPk(taskId);
    if (!task || task.userId !== req.userId) {
      return res.status(404).json({ error: 'Task not found' });
    }
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    await task.addCollaborator(user);
    res.json({ message: 'Collaborator added successfully' });
  } catch (error) {
    console.error('Error adding collaborator:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
