const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Banner = sequelize.define(
  'banner',
  {
    id: { 
      type: DataTypes.UUID, 
      primaryKey: true, 
      defaultValue: DataTypes.UUIDV4 
    },
    title: { 
      type: DataTypes.STRING, 
      allowNull: false 
    },
    imageUrl: { 
      type: DataTypes.STRING, 
      allowNull: false 
    },
    targetUrl: { 
      type: DataTypes.STRING, 
      allowNull: true 
    },
    placement: { 
      type: DataTypes.ENUM('homepage', 'listing', 'search'), 
      allowNull: false 
    },
    startDate: { 
      type: DataTypes.DATE, 
      allowNull: false 
    },
    endDate: { 
      type: DataTypes.DATE, 
      allowNull: false 
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
    tableName: 'banner'
  }
);

module.exports = Banner;