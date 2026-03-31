import express from 'express';
import { getCars, getUserData, googleLogin, loginUser, registerUser } from '../controllers/userController.js';
import { protect } from '../middleware/auth.js';


const userRouter = express.Router();

userRouter.post('/register', registerUser)
userRouter.post('/login', loginUser)
userRouter.post('/google-login', googleLogin)
userRouter.get('/data', protect, getUserData)
userRouter.get('/cars', getCars);

export default userRouter;