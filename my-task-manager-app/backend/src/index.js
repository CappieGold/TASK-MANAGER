import express from 'express';
import { sequelize, User, Project, Task, Comment, ProjectCollaborator, TaskCollaborator } from './models/index.js';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import taskRoutes from './routes/tasks.js';
import projectRoutes from './routes/projects.js';
import commentRoutes from './routes/comments.js';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware pour JSON
app.use(express.json());

// Middleware CORS avec gestion des requêtes préliminaires
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:5173');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Authorization, Content-Type');
  if (req.method === 'OPTIONS') {
    res.sendStatus(204);
  } else {
    next();
  }
});

// Middleware CORS (utilisation de cors package)
app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Authorization', 'Content-Type'],
  credentials: true
}));

const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Authorization', 'Content-Type'],
    credentials: true,
  },
});

// Connect to PostgreSQL and synchronize models
sequelize.authenticate()
  .then(() => {
    console.log('Connection to PostgreSQL has been established successfully.');
    return sequelize.sync({ alter: true });
  })
  .then(() => {
    console.log('Database synchronized');
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/comments', commentRoutes);

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.post('/test', (req, res) => {
  console.log('Test route received:', req.body);
  res.json({ message: 'Test route working' });
});

io.on('connection', (socket) => {
  console.log('A user connected');
  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

app.set('io', io);

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
