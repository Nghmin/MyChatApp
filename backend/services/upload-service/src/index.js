import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import uploadRoutes from './routes/uploadRoutes.js';
dotenv.config();

const app = express();
// Middleware 
app.use(cors());
app.use('/upload', uploadRoutes);

app.use(express.json());
const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`🚀 Upload Service chạy tại cổng ${PORT}`);
});