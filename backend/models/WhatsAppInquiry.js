// import { DataTypes } from 'sequelize';
// import sequelize from '../config/database.js';

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database.js');

const WhatsAppInquiry = sequelize.define(
  'whatsapp_inquiry',
  {
    id: { 
      type: DataTypes.UUID, 
      primaryKey: true, 
      defaultValue: DataTypes.UUIDV4 
    },
    propertyId: { 
      type: DataTypes.UUID, 
      allowNull: false 
    },
    companyId: { 
      type: DataTypes.UUID, 
      allowNull: false 
    },
    customerPhone: { 
      type: DataTypes.STRING, 
      allowNull: false 
    },
    message: { 
      type: DataTypes.TEXT, 
      allowNull: false 
    },
    responseTime: { 
      type: DataTypes.INTEGER, 
      allowNull: true 
    },
    status: { 
      type: DataTypes.ENUM('pending', 'responded', 'closed'), 
      defaultValue: 'pending' 
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
    tableName: 'whatsapp_inquiry'
  }
);

module.exports = WhatsAppInquiry;