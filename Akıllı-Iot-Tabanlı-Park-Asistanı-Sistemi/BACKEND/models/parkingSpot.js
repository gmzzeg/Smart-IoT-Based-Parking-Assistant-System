import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

const ParkingSpot = sequelize.define('ParkingSpot', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  barrierId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  isAvailable: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  isBarrierOpen: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  floor: {
    type: DataTypes.STRING,
    allowNull:true
  }
  
}, {
  timestamps: false,
  tableName: 'parkingSpots'
});

export default ParkingSpot;
