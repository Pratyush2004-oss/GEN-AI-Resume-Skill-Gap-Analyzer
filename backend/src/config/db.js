import mongoose from "mongoose";

export const connectDB = async () => {
    try {
       const connection = await mongoose.connect(process.env.MONGODB_URI);
        // The mobile field was removed from the user schema, but older
        // deployments may still have its unique index.
        try {
            await connection.connection.db.collection("users").dropIndex("mobile_1");
            console.log("Removed obsolete users.mobile_1 index");
        } catch (error) {
            if (error.code !== 27 && error.codeName !== "IndexNotFound") {
                throw error;
            }
        }
        console.log("Database connected", connection.connection.host);
    } catch (error) {
        console.error("Database connection or migration failed:", error);
        process.exit(1);
    }
};