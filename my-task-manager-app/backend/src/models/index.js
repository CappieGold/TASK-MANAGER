import sequelize from '../config/database.js';
import User from './User.js';
import Project from './Project.js';
import Task from './Task.js';
import Comment from './Comment.js';

const ProjectCollaborator = sequelize.define('ProjectCollaborator', {});
const TaskCollaborator = sequelize.define('TaskCollaborator', {});

User.belongsToMany(Project, { through: ProjectCollaborator, as: 'CollaboratedProjects' });
Project.belongsToMany(User, { through: ProjectCollaborator, as: 'Collaborators' });

User.belongsToMany(Task, { through: TaskCollaborator, as: 'CollaboratedTasks' });
Task.belongsToMany(User, { through: TaskCollaborator, as: 'Collaborators' });

Project.hasMany(Task, { foreignKey: 'projectId' });
Task.belongsTo(Project, { foreignKey: 'projectId' });

Task.hasMany(Comment, { foreignKey: 'taskId' });
Comment.belongsTo(Task, { foreignKey: 'taskId' });

User.hasMany(Comment, { foreignKey: 'userId' });
Comment.belongsTo(User, { foreignKey: 'userId' });

Project.belongsTo(User, { as: 'Creator', foreignKey: 'userId' }); // Ajout de cette ligne

export { sequelize, User, Project, Task, Comment, ProjectCollaborator, TaskCollaborator };
