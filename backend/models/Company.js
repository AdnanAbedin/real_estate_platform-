const { DataTypes } = require('sequelize');
const sequelize = require('../config/database.js');

const Company = sequelize.define(
  'company',
  {
    id: { 
      type: DataTypes.UUID, 
      primaryKey: true, 
      defaultValue: DataTypes.UUIDV4 
    },
    name: { 
      type: DataTypes.STRING, 
      allowNull: false 
    },
    description: { 
      type: DataTypes.TEXT, 
      allowNull: true 
    },
    logo: { 
      type: DataTypes.STRING, 
      allowNull: true 
    },
    contactEmail: { 
      type: DataTypes.STRING, 
      allowNull: false 
    },
    whatsappNumber: { 
      type: DataTypes.STRING, 
      allowNull: true 
    },
    averageResponseTime: { 
      type: DataTypes.INTEGER, 
      allowNull: true 
    },
    status: { 
      type: DataTypes.ENUM('active', 'inactive'), 
      defaultValue: 'active' 
    },
    createdAt: { 
      type: DataTypes.DATE, 
      allowNull: false, 
      defaultValue: DataTypes.NOW 
    },
    updatedAt: { 
      type: DataTypes.DATE, 
      allowNull: true, 
      defaultValue: DataTypes.NOW 
    },
    isDeleted: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    }
  },
  {
    timestamps: false,
    tableName: 'company'
  }
);

module.exports = Company;
