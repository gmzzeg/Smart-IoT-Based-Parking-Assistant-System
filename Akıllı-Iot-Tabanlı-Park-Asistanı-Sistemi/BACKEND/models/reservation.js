// models/Reservation.js
import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

const Reservation = sequelize.define('Reservation', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  parkingSpotId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  startTime: {
    type: DataTypes.DATE,
    allowNull: false
  },
  endTime: {
    type: DataTypes.DATE,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('pending', 'confirmed', 'cancelled','waiting','completed'),
    defaultValue: 'pending'
  }
}, {
  timestamps: true,
  tableName: 'reservations'
});

export default Reservation;
