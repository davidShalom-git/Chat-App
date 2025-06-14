import cloudinary from "../lib/cloudinary.js";
import { generateTokens } from "../lib/utils.js";
import User from "../models/user.model.js";
import bcrypt from 'bcryptjs';

export const signup = async (req, res) => {
    const { fullname, email, password } = req.body;
    try {
        // Validate password length
        if (password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters long" });
        }

        // Check if the email already exists
        const user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: "Email already exists" });
        }

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(password, salt);

        // Create new user
        const newUser = new User({
            fullname,
            email,
            password: hashPassword  // Save the hashed password
        });

        // Save new user and generate tokens
        await newUser.save();
        generateTokens(newUser._id, res);

        // Send response without password
        res.status(201).json({
            _id: newUser._id,
            fullname: newUser.fullname,
            email: newUser.email
        });

    } catch (error) {
        console.error("Error during user signup:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const login = async (req, res) => {
    const { email, password } = req.body;

    try {

        const user = await User.findOne({ email })

        if (!user) {
            return res.status(400).json({ message: "Invalid Credential" })
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password)

        if (!isPasswordCorrect) {
            return res.status(400).json({ message: "Invalid Credential" })
        }

        generateTokens(user._id, res)
        res.status(200).json({
            _id: user._id,
            fullname: user.fullname,
            email: user.email,
            profilePic: user.profilePic
        })


    } catch (error) {
        console.log(error.message)
        res.status(500).json({ message: "Internal Server Error" })
    }
};

export const logout = (req, res) => {

    try {
        res.cookie("jwt", "", { maxAge: 0 })
        res.status(200).json({ message: "Logged Out Successfully" })
    }
    catch (error) {
        console.log(error.message)
        res.status(500).json({ message: "Internal Server Error" })
    }
};


export const updateProfile = async (req, res) => {
    try {
        const { profilePic } = req.body;
        const userId = req.user._id

        if (!profilePic) {
            return res.status(400).json({ message: "Profile Pic is Required" });

        }

        const uploadResponse = await cloudinary.uploader.upload(profilePic)
        const updatedUser = await User.findByIdAndUpdate(userId, { profilePic: uploadResponse.secure_url }, { new: true })

        res.status(200).json(updatedUser)

    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "Internal Server Error" })

    }
}


export const checkAuth = (req,res) => {
    try{
        res.status(200).json(req.user)
    }
    catch(error)
    {
        res.status(500).json({message: "Internal Server Error"})
    }

}