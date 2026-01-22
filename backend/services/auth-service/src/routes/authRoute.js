import express from 'express';
import { validateRegister  , validateLogin} from '../middleware/authMiddleware.js';
import {postRegister} from '../controllers/registerController.js';
import {postLogin} from '../controllers/LoginController.js';
import {putUpdateProfile} from '../controllers/updateProfileController.js';

const authRouter = express.Router();

// API Đăng ký: POST /register
authRouter.post('/register',validateRegister, postRegister);

// API Đăng nhập: POST /login
authRouter.post('/login',validateLogin, postLogin);

// API upload: put /update
authRouter.put('/update-profile',putUpdateProfile);
export default authRouter;