import imagekit from "../configs/imageKit.js";
import Booking from "../models/Booking.js";
import Car from "../models/Car.js";
import User from "../models/User.js";
import fs from "fs";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// Generate JWT Token
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );
};

// Register Owner
export const registerOwner = async (req, res) => {
    const { name, email, password } = req.body;
     const exists = await User.findOne({ email });
     if (exists) {
         return res.json({ success: false, message: "Owner already exists" }); 
        }
    const hashedPassword = await bcrypt.hash(password, 10);

    const owner = await User.create({ name, email, password: hashedPassword, role: "owner" });

   const token = generateToken(owner);
    res.json({ success: true, token, role: owner.role });
}

// owner login
export const loginOwner = async (req, res) => {
  const { email, password } = req.body;

  const owner = await User.findOne({ email, role: "owner" });
  if (!owner) {
    return res.json({ success: false, message: "Owner not found" });
  }

  const isMatch = await bcrypt.compare(password, owner.password);
  if (!isMatch) {
    return res.json({ success: false, message: "Invalid credentials" });
  }

  const token = generateToken(owner);

  res.json({ success: true, token, role: owner.role });
};

// Api to list car

export const addCar = async (req, res) => {
    try {
        const {_id} = req.user;
        let car = JSON.parse(req.body.CarData);
        const imageFile = req.file;

         const fileBuffer = fs.readFileSync(imageFile.path);
         const response = await imagekit.upload({
            file: fileBuffer,
            fileName: imageFile.originalname,
            folder: '/cars'
         })

         // optimization through imagekit URL transformation
            var optimizedImageUrl = imagekit.url({
                path: response.filePath,
                transformation: [
                    {width: '1280'}, // Width resizing
                    {quality: 'auto'}, // Auto compression
                    {format: 'webp'} // convert to modern format
                ]
            })

            const image = optimizedImageUrl;
            await Car.create({...car, owner: _id, image});

            res.json({success: true, message: "Car listed successfully"})


    } catch (error) {
        console.log(error.message)
        res.json({success:false, message: error.message})
    }
}

// Api to list  Owner cars
export const getOwnerCars = async (req, res) => {
    try {
        const {_id} = req.user;
        const cars = await Car.find({owner: _id})
        res.json({success: true, cars})
    } catch (error) {
        console.log(error.message)
        res.json({success:false, message: error.message})
    }
}

// Api to toggle Car Availability
export const toggleCarAvailability = async (req, res) => {
    try {
        const {_id} = req.user;
        const {carId} = req.body;
        const car = await Car.findById(carId);

        //checking is car belong to the 
        if(car.owner.toString() !== _id.toString()){
            return res.json({success: false, message: "You are not authorized to perform this action"});
        }
        car.isAvailable = !car.isAvailable;
        await car.save();

        res.json({success: true, message: "Availability status changed successfully"})
    } catch (error) {
        console.log(error.message)
        res.json({success:false, message: error.message})
    }
}

export const deleteCar = async (req, res) => {
    try {
        const {_id} = req.user;
        const {carId} = req.body;
        const car = await Car.findById(carId);

        //checking is car belong to the 
        if(car.owner.toString() !== _id.toString()){
            return res.json({success: false, message: "You are not authorized to perform this action"});
        }
        car.owner = null;
        car.isAvailable = false;
        await car.save();

        res.json({success: true, message: "Car Removed!"})
    } catch (error) {
        console.log(error.message)
        res.json({success:false, message: error.message})
    }
}


// Api to get Dashboard Data
export const getDashboardData = async (req, res) => {
  try {
    const { _id, role } = req.user;

    if (role !== 'owner') {
      return res.json({ success: false, message: "Unauthorized Access" });
    }

    const cars = await Car.find({ owner: _id });

    const bookingsRaw = await Booking.find({ owner: _id })
      .populate('car')
      .sort({ createdAt: -1 });

    // 🔥 Remove bookings where car is deleted
    const bookings = bookingsRaw.filter(booking => booking.car !== null);

    const pendingBookings = bookings.filter(b => b.status === "pending");
    const completedBookings = bookings.filter(b => b.status === "confirmed");

    // 🔥 Correct Monthly Revenue Calculation
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const monthlyRevenue = bookings
      .filter(booking => {
        const bookingDate = new Date(booking.createdAt);
        return (
          booking.status === "confirmed" &&
          bookingDate.getMonth() === currentMonth &&
          bookingDate.getFullYear() === currentYear
        );
      })
      .reduce((acc, booking) => acc + booking.price, 0);

    const dashboardData = {
      totalCars: cars.length,
      totalBookings: bookings.length,
      pendingBookings: pendingBookings.length,
      completedBookings: completedBookings.length,
      recentBookings: bookings.slice(0, 3),
      monthlyRevenue
    };

    res.json({ success: true, dashboardData });

  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

// API to update user image

export const updateUserImage = async (req, res) => {
    try {
        const { _id } = req.body;
        const imageFile = req.file;

        //upload image to imagekit
          const fileBuffer = fs.readFileSync(imageFile.path);
          const response = await imagekit.upload({
            file: fileBuffer,
            fileName: imageFile.originalname,
            folder: '/users'
          })
          // optimization through imagekit URL transformation
           var optimizedImageUrl = imagekit.url({
                path: response.filePath,
                transformation: [
                    {width: '400'}, // Width resizing
                    {quality: 'auto'}, // Auto compression
                    {format: 'webp'} // convert to modern format
                ]
            });
            const image = optimizedImageUrl;
            await User.findByIdAndUpdate(_id, {image});
            res.json({success: true, message: "Profile image updated successfully"})

    } catch (error) {
         console.log(error.message)
        res.json({success:false, message: error.message})
    }
}