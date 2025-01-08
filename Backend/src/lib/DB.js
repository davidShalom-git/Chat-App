import mongoose from 'mongoose';

export const connectDB = async() => {
    try{
        const conn = await mongoose.connect(process.env.MONGODB_URI)
        console.log("MongoDB Connected Voi..")
    }
    catch(error)
    {
        console.log("No Connected ra..")
    }
}

