// routes/tasks.js

import express from 'express';
import Task from '../models/Task.js';
import Comment from '../models/Comment.js';
import User from '../models/User.js';
import Project from '../models/Project.js';
import { verifyToken } from '../middleware/auth.js';
import { Op } from 'sequelize';

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

// Récupérer toutes les tâches de l'utilisateur
router.get('/', async (req, res) => {
  try {
    const tasks = await Task.findAll({
      where: {
        [Op.or]: [
          { userId: req.userId },
          { '$Collaborators.id$': req.userId }
        ]
      },
      include: [
        {
          model: Comment,
          include: [User]
        },
        {
          model: User,
          as: 'Collaborators',
          attributes: ['id', 'username', 'email'],
          through: { attributes: [] }
        }
      ]
    });
    res.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ error: error.message });
  }
});

// Récupérer toutes les tâches de l'utilisateur pour un projet spécifique
router.get('/project/:projectId', async (req, res) => {
  const { projectId } = req.params;
  try {
    const project = await Project.findByPk(projectId, {
      include: [{
        model: User,
        as: 'Collaborators',
        where: { id: req.userId },
        required: false
      }]
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const tasks = await Task.findAll({
      where: { projectId },
      include: [{
        model: Comment,
        include: [User]
      }]
    });

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
    const project = await Project.findByPk(task.projectId, {
      include: [{
        model: User,
        as: 'Collaborators',
        where: { id: req.userId },
        required: false
      }]
    });
    
    if (!task || (task.userId !== req.userId && !project)) {
      return res.status(404).json({ error: 'Task not found or user is not a collaborator' });
    }

    task.title = title || task.title;
    task.description = description || task.description;
    task.status = status || task.status;
    task.projectId = projectId || task.projectId;
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
    const project = await Project.findByPk(task.projectId, {
      include: [{
        model: User,
        as: 'Collaborators',
        where: { id: req.userId },
        required: false
      }]
    });

    if (!task || (task.userId !== req.userId && !project)) {
      return res.status(404).json({ error: 'Task not found or user is not a collaborator' });
    }

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

export default router;
