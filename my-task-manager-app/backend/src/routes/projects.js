// routes/projects.js

import express from 'express';
import { Op } from 'sequelize';
import Project from '../models/Project.js';
import Task from '../models/Task.js';
import Comment from '../models/Comment.js';
import User from '../models/User.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Middleware pour vérifier le token JWT
router.use(verifyToken);

// Créer un nouveau projet
router.post('/', async (req, res) => {
  const { name, description } = req.body;
  try {
    const project = await Project.create({ name, description, userId: req.userId });
    res.status(201).json(project);
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ error: error.message });
  }
});

// Récupérer tous les projets de l'utilisateur
router.get('/', async (req, res) => {
  try {
    const projects = await Project.findAll({
      where: {
        [Op.or]: [
          { userId: req.userId },
          { '$Collaborators.id$': req.userId }
        ]
      },
      include: [
        {
          model: User,
          as: 'Collaborators',
          attributes: ['id', 'username', 'email'],
          through: { attributes: [] } // Exclure les attributs de la table de jointure
        },
        {
          model: Task,
          include: [
            {
              model: Comment,
              include: [User]
            }
          ]
        }
      ]
    });
    res.json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ error: error.message });
  }
});

// Mettre à jour un projet
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;
  try {
    const project = await Project.findByPk(id);
    if (!project || project.userId !== req.userId) {
      return res.status(404).json({ error: 'Project not found' });
    }
    project.name = name;
    project.description = description;
    await project.save();
    res.json(project);
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({ error: error.message });
  }
});

// Supprimer un projet
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const project = await Project.findByPk(id);
    if (!project || project.userId !== req.userId) {
      return res.status(404).json({ error: 'Project not found' });
    }
    await project.destroy();
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({ error: error.message });
  }
});

// Route pour ajouter un collaborateur à un projet
router.post('/:projectId/collaborators', async (req, res) => {
  const { projectId } = req.params;
  const { email } = req.body;
  try {
    const project = await Project.findByPk(projectId);
    if (!project || project.userId !== req.userId) {
      return res.status(404).json({ error: 'Project not found' });
    }
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    await project.addCollaborator(user);
    res.json({ message: 'Collaborator added successfully' });
  } catch (error) {
    console.error('Error adding collaborator:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
