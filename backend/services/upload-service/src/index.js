import express from 'express';
import dotenv from 'dotenv';
import uploadRoute from './routes/uploadRoute.js';
dotenv.config();

const app = express();
// Middleware 
app.use('/', uploadRoute);

app.use(express.json());
const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`🚀 Upload Service chạy tại cổng ${PORT}`);
});