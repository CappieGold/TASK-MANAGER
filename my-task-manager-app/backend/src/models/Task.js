import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import User from './User.js';

const Task = sequelize.define('Task', {
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('pending', 'in_progress', 'completed'),
    defaultValue: 'pending',
  },
  projectId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
});

// Table de jonction pour les collaborations
const TaskCollaborator = sequelize.define('TaskCollaborator', {});

Task.belongsToMany(User, { through: TaskCollaborator, as: 'Collaborators' });
User.belongsToMany(Task, { through: TaskCollaborator });

export default Task;
export { TaskCollaborator };
