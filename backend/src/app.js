import {fileURLToPath} from "url"
import path from "path"
import fs from "fs"
import express from "express";
import dotenv from "dotenv";
dotenv.config();
import cookieParser from "cookie-parser";
import AuthRoutes from "./routes/auth.route.js";
import InterviewRoutes from "./routes/interview.route.js";
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
    // Expose Content-Disposition so the browser can read the filename the
    // backend attaches to the resume PDF download.
    exposedHeaders: ["Content-Disposition"],
  })
);

// frontend file handlers
const FRONTEND_DIST = fileURLToPath(new URL("../../frontend/dist", import.meta.url));
const hasFrontendDist = fs.existsSync(FRONTEND_DIST);

if(hasFrontendDist) {
  // static assets (JS/CSS/images) produced by the vite build
  app.use(express.static(FRONTEND_DIST));

  // SPA fallback: serve index.html for any non-API GET so client-side routes
  // (/login, /signup, ...) work on refresh. Express 5 dropped the '*' wildcard,
  // so this final middleware is used instead of app.get('*').
  app.use((req, res, next) => {
    if (req.method === "GET" && !req.path.startsWith("/api/")) {
      return res.sendFile(path.join(FRONTEND_DIST, "index.html"))
    }
    next()
  })
}

// Mount auth routes.
app.use("/api/auth", AuthRoutes);
app.use('/api/interview', InterviewRoutes);


// error handler
app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    process.env.NODE_ENV === "production" ? res.status(statusCode).json({ message: err.message }) :
        res.status(statusCode).json({ message: err.message, stack: err.stack });
});

export default app;
