import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoute.js';
import connectDB from './config/mongoDB.js';

dotenv.config();
const app = express();
// Database
connectDB();
// Middleware
app.use(express.json());

app.use(express.urlencoded({ extended: true }));
// Routes
app.use('/', authRoutes);

const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`Auth Service chạy tại port: ${PORT}`));