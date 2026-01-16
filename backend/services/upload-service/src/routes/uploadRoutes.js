import express from 'express';
import { upload } from '../config/cloudinary.js';
import { postUpload } from '../controllers/uploadcController.js';

const uploadRouter = express.Router();

uploadRouter.post('/', upload.single('file'), postUpload);

export default uploadRouter;