import express from 'express';
import { validateRegister  , validateLogin} from '../middleware/authMiddleware.js';
import {postRegister} from '../controllers/registerController.js';
import {postLogin} from '../controllers/LoginController.js';
import {putUpdateProfile} from '../controllers/updateProfileController.js';

const router = express.Router();

// API Đăng ký: POST /register
router.post('/register',validateRegister, postRegister);

// API Đăng nhập: POST /login
router.post('/login',validateLogin, postLogin);

// API upload: put /update
router.put('/update-profile',putUpdateProfile);
export default router;