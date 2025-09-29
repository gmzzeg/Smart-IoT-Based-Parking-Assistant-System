import { Sequelize, DataTypes } from 'sequelize';
import JWT from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { sequelize } from '../config/db.js';


// Kullanıcı Modelini Tanımla
const User = sequelize.define('User', {
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  surname: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  phoneNumber: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  timestamps: false,
});

// JWT Token Oluşturma
User.prototype.generateToken = function() {
  return JWT.sign({ id: this.id }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });
};

// Şifreyi karşılaştırmak için comparePassword prototipi
User.prototype.comparePassword = async function(plainPassword) {
  return await bcrypt.compare(plainPassword, this.password);
};


export default User;
