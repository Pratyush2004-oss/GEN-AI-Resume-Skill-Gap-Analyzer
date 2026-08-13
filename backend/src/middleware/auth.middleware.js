import expressAsyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";
import UserModel from "../models/user.model.js";
export const isAuth = expressAsyncHandler(async (req, res, next) => {
    try {
        let token;
        if (req.headers.authorization?.startsWith("Bearer ")) {
            token = req.headers.authorization.split(" ")[1];
        } else if (req.cookies?.accessToken) {
            token = req.cookies.accessToken;
        }
        let decoded;
        try {
            decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET); 
        } catch (error) {
            return res.status(401).json({ message: "Unauthorized, Invalid access token" });
        }
        const user = await UserModel.findById(decoded.id);
        if (!user) {
            return res.status(401).json({ message: "Unauthorized, User not found" });
        }
        req.user = user;
        next();
    } catch (error) {
        console.log("Error in isAuth middleware: ", error);
        next(error);
    }
})