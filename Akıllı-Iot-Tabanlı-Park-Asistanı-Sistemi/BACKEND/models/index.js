import User from './userModel.js';
import Reservation from './reservation.js';
import ParkingSpot from './parkingSpot.js';

// USER - RESERVATION (1:1)
// A user can have only one reservation, and each reservation belongs to a single user.
User.hasOne(Reservation, { foreignKey: 'userId', onDelete: 'CASCADE' });
Reservation.belongsTo(User, { foreignKey: 'userId' });

// PARKINGSPOT - RESERVATION (1:n)
// A parking spot can have many reservations, and each reservation belongs to a single parking spot.
ParkingSpot.hasMany(Reservation, { foreignKey: 'parkingSpotId', onDelete: 'CASCADE', as: 'reservations' });
Reservation.belongsTo(ParkingSpot, { foreignKey: 'parkingSpotId', as: 'parkingSpot' });


export {
  User,
  Reservation,
  ParkingSpot
};
