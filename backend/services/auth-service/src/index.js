import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';

dotenv.config();
const app = express();
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));

mongoose.connect(process.env.MONGO_URI_AUTH) 
  .then(() => console.log("Auth Service connected to MongoDB"))
  .catch(err => console.error(err));

app.use('/', authRoutes);

const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`Auth Service chạy tại port: ${PORT}`));