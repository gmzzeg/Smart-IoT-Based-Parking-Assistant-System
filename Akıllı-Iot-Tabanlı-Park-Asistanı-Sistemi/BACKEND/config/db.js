import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

// Sequelize bağlantısını oluştur
const sequelize = new Sequelize(
  process.env.DB_NAME, 
  process.env.DB_USER, 
  process.env.DB_PASSWORD, 
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'mysql',
    timezone: '+03:00',
    dialectOptions: {
      dateStrings: true,
      typeCast: true
    },
    logging: false,
  }
);

// Veritabanı bağlantısını sağla
const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log(`MySQL Connected: ${sequelize.options.host}`);
  } catch (error) {
    console.log(`MySQL Connection Error: ${error.message}`);
  }
};

// Veritabanı senkronizasyonu
const syncDB = async () => {
  try {
    await sequelize.sync({ alter : true }); 
    console.log("Veritabanı senkronize edildi.");
  } catch (error) {
    console.error("Senkronizasyon hatası:", error);
  }
};

export { sequelize, syncDB }; // Default dışındaki export'lar burada
export default connectDB;
