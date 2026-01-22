import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/mongoDB.js';
import friendRoutes from './routes/friendRoutes.js';
dotenv.config();

const app = express();
connectDB();
// Middleware 
app.use(cors());
app.use(express.json());

app.use('/', friendRoutes);
const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`🚀 Friend Service chạy tại cổng ${PORT}`);
});