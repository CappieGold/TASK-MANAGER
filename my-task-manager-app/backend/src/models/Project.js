import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import User from './User.js';

const Project = sequelize.define('Project', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
});

// Table de jonction pour les collaborations
const ProjectCollaborator = sequelize.define('ProjectCollaborator', {});

Project.belongsToMany(User, { through: ProjectCollaborator, as: 'Collaborators' });
User.belongsToMany(Project, { through: ProjectCollaborator });

export default Project;
export { ProjectCollaborator };
