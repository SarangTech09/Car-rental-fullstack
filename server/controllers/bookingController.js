import Booking from "../models/Booking.js";
import Car from "../models/Car.js";
import { sendEmail } from "../utils/sendEmail.js";

// Function to check Availability of Car for a given date
const checkAvailability = async (car, pickupDate, returnDate) => {
  const bookings = await Booking.find({
    car,
    pickupDate: { $lte: returnDate },
    returnDate: { $gte: pickupDate },
  });
  return bookings.length === 0;
};

// API to check Availability of Cars for the given date and location
export const checkAvailabilityOfCars = async (req, res) => {
  try {
    const { location, pickupDate, returnDate } = req.body;

    //fetch all available cars for the given location
    const cars = await Car.find({ location, isAvailable: true });

    // check car availability for the given date range using promise.
    const availableCarsPromises = cars.map(async (car) => {
      const isAvailable = await checkAvailability(
        car._id,
        pickupDate,
        returnDate,
      );
      return { ...car._doc, isAvailable: isAvailable };
    });

    let availableCars = await Promise.all(availableCarsPromises);
    availableCars = availableCars.filter((car) => car.isAvailable === true);

    res.json({ success: true, availableCars });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

// API to create Booking
export const createBooking = async (req, res) => {
  try {
    const { _id } = req.user;
    const { car, pickupDate, returnDate } = req.body;

    const isAvailable = await checkAvailability(car, pickupDate, returnDate);
    if (!isAvailable) {
      return res.json({ success: false, message: "Car is not Available" });
    }

    const carData = await Car.findById(car).populate("owner");
    const userData = req.user;

    // Calculate price
    const picked = new Date(pickupDate);
    const returned = new Date(returnDate);
    const noOfDays = Math.ceil((returned - picked) / (1000 * 60 * 60 * 24));
    const price = carData.pricePerDay * noOfDays;

    const booking = await Booking.create({
      car,
      owner: carData.owner._id,
      user: _id,
      pickupDate,
      returnDate,
      price,
    });

    // Email to User
     await sendEmail(
      userData.email,
      "Booking Request Received 🚗",
      `
      <h2>Hi ${userData.name},</h2>
      <p>Your booking request has been received.</p>
      <p>Please wait while the owner confirms it.</p>
      <br/>
      <p>Thank you for choosing us!</p>
      `
    );

    // Email to Owner
     await sendEmail(
      carData.owner.email,
      "New Booking Request 🚨",
      `
      <h2>Hello ${carData.owner.name},</h2>
      <p>You have received a new booking request.</p>
      <p>Please log in to your dashboard and confirm it.</p>
      `
    );

    res.json({ success: true, message: "Booking created successfully" });

  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

// API to get User Bookings
export const getUserBookings = async (req, res) => {
  try {
    const { _id } = req.user;
    const bookings = await Booking.find({ user: _id })
      .populate("car")
      .sort({ createdAt: -1 });
    res.json({ success: true, bookings });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

// API to get Owner Bookings
export const getOwnerBookings = async (req, res) => {
  try {
    if (req.user.role !== "owner") {
      return res.json({
        success: false,
        message: "You are not authorized to access this resource",
      });
    }

    const bookingsRaw = await Booking.find({ owner: req.user._id })
      .populate("car")
      .populate({
        path: "user",
        select: "-password"
      })
      .sort({ createdAt: -1 });

    //  Remove bookings where referenced docs were deleted
    const bookings = bookingsRaw.filter(
      booking => booking.car !== null && booking.user !== null
    );

    res.json({ success: true, bookings });

  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

// API to update Booking Status
export const updateBookingStatus = async (req, res) => {
  try {
    const { _id } = req.user;
    const { bookingId, status } = req.body;

    const booking = await Booking.findById(bookingId)
      .populate("user")
      .populate("car");

    if (!booking) {
      return res.json({ success: false, message: "Booking not found" });
    }

    if (booking.owner.toString() !== _id.toString()) {
      return res.json({
        success: false,
        message: "You are not authorized to perform this action",
      });
    }

    booking.status = status;
    await booking.save();

    // Send confirmation email ONLY if confirmed
    if (status === "confirmed") {
       await sendEmail(
        booking.user.email,
        "Booking Confirmed ✅",
        `
        <h2>Good news ${booking.user.name}!</h2>
        <p>Your booking for ${booking.car.brand} has been confirmed.</p>
        <p>Thank you for waiting.</p>
        <br/>
        <p>We wish you a great ride 🚗</p>
        `
      );
    }

    res.json({ success: true, message: "Booking status updated successfully" });

  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};
