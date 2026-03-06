import express from 'express';
import { protect } from '../middleware/auth.js';
import { addCar, deleteCar, getDashboardData, getOwnerCars, loginOwner, registerOwner, toggleCarAvailability, updateUserImage } from '../controllers/ownerController.js';
import upload from '../middleware/multer.js';
import { isOwner } from '../middleware/role.js';

const ownerRouter = express.Router();

//owner registration route
ownerRouter.post("/register", registerOwner);

//owner login route
ownerRouter.post('/login', loginOwner);

//owner protected routes
ownerRouter.post('/add-car', upload.single("image"), protect, isOwner, addCar);
ownerRouter.get('/cars', protect, isOwner, getOwnerCars);
ownerRouter.post('/toggle-car', protect, isOwner, toggleCarAvailability);
ownerRouter.post('/delete-car', protect, isOwner, deleteCar);

ownerRouter.get('/dashboard', protect, isOwner, getDashboardData);
ownerRouter.post('/update-image', upload.single("image"), protect, isOwner, updateUserImage);


export default ownerRouter; 