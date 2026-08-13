import express from "express";
import cookieParser from "cookie-parser";
import AuthRoutes from "./routes/auth.route.js";
import cors from "cors";
const app = express();

// Parse JSON request bodies.
app.use(express.json());

// Parse cookies so refresh tokens can be read from req.cookies.
app.use(cookieParser());

// Enable CORS.
app.use(
  cors({
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Mount auth routes.
app.use("/api/auth", AuthRoutes);


// error handler
app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    process.env.NODE_ENV === "production" ? res.status(statusCode).json({ message: err.message }) :
        res.status(statusCode).json({ message: err.message, stack: err.stack });
});

export default app;