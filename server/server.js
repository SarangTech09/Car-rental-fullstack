import express from 'express';
import "dotenv/config";
import cors from "cors";
import connectDB from './configs/db.js';
import userRouter from './routes/userRoutes.js';
import ownerRouter from './routes/ownerRoutes.js';
import bookingRouter from './routes/bookingRoutes.js';

// Initialize express app

const app = express();

// connect databse
await connectDB();

// Middleware
app.use(cors({
     origin: "https://car-rental-frontend-eta-three.vercel.app",
     credentials: true
}));
app.use(express.json());

// Routes
app.get('/', (req, res) => res.send("Server is running baby boo ya!"));
app.use('/api/user', userRouter);
app.use('/api/owner', ownerRouter);
app.use('/api/bookings', bookingRouter);

// start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`))
