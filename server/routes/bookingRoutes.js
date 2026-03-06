import express from 'express';

import { checkAvailabilityOfCars, createBooking, getOwnerBookings, getUserBookings, updateBookingStatus } from '../controllers/bookingController.js';
import { protect } from '../middleware/auth.js';

const bookingRouter = express.Router();

bookingRouter.post('/check-availability', checkAvailabilityOfCars);
bookingRouter.post('/create', protect, createBooking);
bookingRouter.get('/user', protect, getUserBookings);
bookingRouter.get('/owner', protect, getOwnerBookings);
bookingRouter.post('/change-status', protect, updateBookingStatus);

export default bookingRouter;