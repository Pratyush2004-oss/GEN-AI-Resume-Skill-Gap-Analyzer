import mongoose from "mongoose";

export const connectDB = async () => {
    try {
       const connection = await mongoose.connect(process.env.MONGODB_URI);
        console.log("Database connected", connection.connection.host);
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
};