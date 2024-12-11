// src/routes/auth.js
import express from 'express';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { body, validationResult } from 'express-validator';
import Project from '../models/Project.js';  // Import the Project model

const router = express.Router();

// Register
router.post('/register', [
  body('username').notEmpty().withMessage('Username is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password')
    .matches(/^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/)
    .withMessage('Password must be at least 8 characters long and include an uppercase letter, a number, and a special character')
], async (req, res) => {
  console.log('Register route received:', req.body); // Log the incoming request
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { username, email, password } = req.body;
  try {
    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    const existingEmail = await User.findOne({ where: { email } });
    if (existingEmail) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ username, email, password: hashedPassword });
    res.status(201).json({ message: 'User created successfully', user });
  } catch (error) {
    console.error('Error during registration:', error);
    res.status(500).json({ error: error.message });
  }
});

// Login
router.post('/login', [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
  console.log('Login route received:', req.body); // Log the incoming request
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;
  try {
    const user = await User.findOne({
      where: { email },
      include: [
        { model: Project, as: 'CollaboratedProjects' }
      ]
    });

    // Si l'utilisateur n'existe pas, renvoie une seule erreur générique
    if (!user) return res.status(400).json({ error: 'Invalid email or password' });

    // Vérification du mot de passe
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid email or password' });

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token, user });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
