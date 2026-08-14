import "dotenv/config";
import app from "./src/app.js";
import { connectDB } from "./src/config/db.js";

const PORT = process.env.PORT;

connectDB();
app.listen(process.env.PORT, () => {
    console.log(`Server running on port ${process.env.PORT}`);
});