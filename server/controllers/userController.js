import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Car from "../models/Car.js";


// Generate JWT Token
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );
};


export const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body
        
        if(!name || !email || !password || password.length < 8) {
            return res.json({success: false, message: "Fill all the fields properly" });
        }

        const userExists = await User.findOne({email})
        if(userExists){
            return res.json({success: false, message: "User already exists"});
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({name, email, password: hashedPassword})
        const token = generateToken(user);
        res.json({success: true, token, role: user.role});


    } catch (error) {
        console.log(error.message);
        res.json({success: false, message: error.message});
    }
}

// Login User
export const loginUser = async (req, res) => {
    try {
        const {email, password} = req.body;
        const user = await User.findOne({email, role: "user"});
        if(!user){
            return res.json({success: false, message: "User not found"});
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch){
            return res.json({success: false, message: "Invalid Credentials"});
        }

        const token = jwt.sign(
         { id: user._id, role: user.role },
         process.env.JWT_SECRET,
        { expiresIn: "1d" }
  ); 

     res.json({ success: true, token, role: user.role });

    } catch (error) {
        console.log(error.message);
        res.json({success: false, message: error.message});
    }
}

// Get User Profile using Token (JWT)

export const getUserData = async (req, res) => {
    try {
        const {user} = req;
        res.json({success: true, user})
    } catch (error) {
       console.log(error.message);
        res.json({success: false, message: error.message});        
    }
}

// Get all cars for the frontend

export const getCars = async (req, res) => {
    try {
        const cars = await Car.find({isAvailable: true})
        res.json({success: true, cars});
    } catch (error) {
         console.log(error.message);
        res.json({success: false, message: error.message});
    }
}