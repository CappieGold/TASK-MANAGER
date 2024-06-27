import express from 'express';
import Comment from '../models/Comment.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

router.use(verifyToken);

// Ajouter un commentaire
router.post('/', async (req, res) => {
  const { content, taskId } = req.body;
  try {
    const comment = await Comment.create({ content, taskId, userId: req.userId });
    const io = req.app.get('io');
    io.emit('commentAdded', comment);
    res.status(201).json(comment);
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ error: error.message });
  }
});

// Récupérer les commentaires d'une tâche
router.get('/:taskId', async (req, res) => {
  const { taskId } = req.params;
  try {
    const comments = await Comment.findAll({ where: { taskId } });
    res.json(comments);
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ error: error.message });
  }
});

// Supprimer un commentaire
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const comment = await Comment.findByPk(id);
    if (!comment || comment.userId !== req.userId) {
      return res.status(404).json({ error: 'Comment not found' });
    }
    await comment.destroy();
    const io = req.app.get('io');
    io.emit('commentDeleted', { id });
    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
