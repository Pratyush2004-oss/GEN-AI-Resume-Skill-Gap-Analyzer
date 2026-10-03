import "dotenv/config";
import app from "./src/app.js";
import { connectDB } from "./src/config/db.js";
import { closeRedis } from "./src/config/redis.js";

const PORT = process.env.PORT;

// connecting the database
connectDB();
// connecting to the backend port
app.listen(process.env.PORT, () => {
    console.log(`Server running on port ${process.env.PORT}`);
});

const shutdown = async (signal) => {
    console.log(`${signal} received, shutting down`);
    await closeRedis();
    process.exit(0);
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));