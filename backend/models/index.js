const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
    id: { type: DataTypes.STRING, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    password: { type: DataTypes.STRING, allowNull: false },
    role: { type: DataTypes.ENUM('Admin', 'Advisor', 'Office', 'Student'), allowNull: false },
    faculty: DataTypes.STRING,
    branch: DataTypes.STRING,
    deptName: DataTypes.STRING,
    phone: DataTypes.STRING,
});

const GraduationRequest = sequelize.define('GraduationRequest', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    studentId: { type: DataTypes.STRING, allowNull: false },
    academicYear: { type: DataTypes.STRING, allowNull: false },
    semester: { type: DataTypes.STRING, allowNull: false },
    status: {
        type: DataTypes.ENUM('Pending', 'In Progress', 'Completed', 'Rejected'),
        defaultValue: 'Pending',
    },
    steps: { type: DataTypes.JSON, defaultValue: {} },
    documents: { type: DataTypes.JSON, defaultValue: [] },
    submittedAt: { type: DataTypes.DATE, allowNull: true },
});

const Notification = sequelize.define('Notification', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    userId: { type: DataTypes.STRING, allowNull: false },
    message: { type: DataTypes.TEXT, allowNull: false },
    type: { type: DataTypes.STRING, defaultValue: 'GENERAL' },
    isRead: { type: DataTypes.BOOLEAN, defaultValue: false },
});

const AuditLog = sequelize.define('AuditLog', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    userId: { type: DataTypes.STRING, allowNull: false },
    action: { type: DataTypes.STRING, allowNull: false },
    requestId: { type: DataTypes.STRING, allowNull: true },
    details: { type: DataTypes.TEXT, allowNull: true },
});

User.hasMany(GraduationRequest, { foreignKey: 'studentId' });
GraduationRequest.belongsTo(User, { foreignKey: 'studentId' });

module.exports = { sequelize, User, GraduationRequest, Notification, AuditLog };
