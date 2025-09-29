import express from 'express';
import colors from 'colors';
import morgan from 'morgan';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import connectDB, { syncDB } from './config/db.js'; // Import connectDB once
import mainRouter from './routes/mainRouter.js';
import './utils/serialReader.js';
import './models/index.js';




// .env yapılandırması
dotenv.config();

// Veritabanı bağlantısı
connectDB();
syncDB();

// Express uygulaması
const app = express();

// Middleware'ler
app.use(morgan('dev'));
app.use(express.json());
app.use(cors());
app.use(cookieParser());

// Ana route
app.use('/api/v1', mainRouter);

// Test endpoint
app.get('/', (req, res) => {
  res.status(200).send('<h1>WELCOME TO NODE SERVER APP</h1>');
});

// Sunucu port ayarı
const PORT = process.env.PORT || 8083;

// Sunucuyu başlat
app.listen(PORT, () => {
  console.log(`Server Running On Port ${PORT}`.bgMagenta.white);
});
