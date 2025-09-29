import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

const ParkingSpotHistory = sequelize.define('ParkingSpotHistory', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  parkingSpotId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'parkingSpots',
      key: 'id'
    }
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: true, // rezervasyonsuzlar için null
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  startTime: {
    type: DataTypes.DATE,
    allowNull: false
  },
  endTime: {
    type: DataTypes.DATE,
    allowNull: true // Araç hâlâ park halindeyse null
  }
}, {
  timestamps: false,
  tableName: 'parkingSpotHistories'
});

export default ParkingSpotHistory;
