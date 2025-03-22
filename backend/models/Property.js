// backend/models/Property.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Property = sequelize.define(
  'property',
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    location: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    companyId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    tier: {
      type: DataTypes.ENUM('standard', 'featured', 'premium'),
      defaultValue: 'standard',
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive', 'sold'),
      defaultValue: 'active',
    },
    imageUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW,
    },
    isDeleted: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    }
  },
  {
    timestamps: false,
    tableName: 'property',
    indexes: [
      { fields: ['title'], using: 'BTREE' },          // For search optimization
      { fields: ['location'], using: 'BTREE' },       // For location-based searches
      { fields: ['price'], using: 'BTREE' },          // For price sorting
      { fields: ['companyId'], using: 'BTREE' },      // For company filtering
      { fields: ['tier', 'status'], using: 'BTREE' }, // For tier/status filtering
    ]
  }
);

module.exports = Property;