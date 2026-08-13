import expressAsyncHandler from "express-async-handler";
import UserModel from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

/**
 * @generateAccessToken
 * @param {*} id 
 * @returns 
 * @description generate access token
 * @access private
 */
const generateAccessToken = (id) => {
    return jwt.sign({ id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "15m" });
}

/**
 * @generateRefreshToken
 * @param {*} id 
 * @returns 
 * @description generate refresh token
 * @access private
 */
const generateRefreshToken = (id) => {
    return jwt.sign({ id }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: "7d" });
}

/**
 * @setRefreshCookie
 * @param {*} res 
 * @param {*} refreshToken 
 * @returns 
 * @description set refresh cookie
 * @access private
 */
const setRefreshCookie = (res, refreshToken) => {
    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: "/",
    });
}

/**
 * @clearRefreshCookie
 * @param {*} res 
 * @returns 
 * @description clear refresh cookie
 * @access private
 */
const clearRefreshCookie = (res) => {
    res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    });
}

/**
 * @signup POST /api/auth/signup
 * @description signup a new user
 * @access public
 */
const signup = expressAsyncHandler(async (req, res, next) => {
    try {
        // check if req.body is not valid
        if (!req.body) {
            res.status(400);
            return res.status(400).json({ message: "Invalid request body" });
        }

        // get inputs 
        const { username, email, password } = req.body;
        if (!username || !email || !password) {
            res.status(400);
            return res.status(400).json({ message: "All fields are required" });
        }

        // check if user already exists 
        const isUserAlreadyExists = await UserModel.findOne({ $or: [{ username }, { email }] }).select("email");
        if (isUserAlreadyExists) {
            res.status(400);
            return res.status(400).json({ message: "User already exists" });
        }

        // hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // create a new user
        const user = await UserModel.create({
            username,
            email,
            password: hashedPassword,
        });

        // create token 
        const accessToken = generateAccessToken(user._id);
        const refreshToken = generateRefreshToken(user._id);

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        setRefreshCookie(res, refreshToken);

        // send response
        res.status(201);
        res.json({
            message: "User created successfully",
            user: {
                _id: user._id,
                username: user.username,
                email: user.email,
            },
            accessToken,
        });

    } catch (error) {
        console.log("Error in signup controller: ", error);
        next(error);
    }
});

/**
 * @login POST /api/auth/login
 * @description login a user
 * @access public
 */
const login = expressAsyncHandler(async (req, res, next) => {
    try {
        // check for req.body
        if (!req.body) {
            res.status(400);
            return res.status(400).json({ message: "Invalid request body" });
        }

        // get inputs
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // check if user exists
        const user = await UserModel.findOne({ email }).select("+password");
        if (!user) {
            return res.status(400).json({ message: "User does not exist" });
        }

        // check if password is correct
        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        // create tokens
        const accessToken = generateAccessToken(user._id);
        const refreshToken = generateRefreshToken(user._id);

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        // set refresh cookie
        setRefreshCookie(res, refreshToken);

        // send response
        res.status(200);
        res.json({
            message: "User logged in successful",
            user: {
                _id: user._id,
                username: user.username,
                email: user.email,
            },
            accessToken,
        });
    } catch (error) {
        console.log("Error in login controller: ", error);
        next(error);
    }
});

/**
 * @refreshToken POST /api/auth/refresh
 * @description Use the refresh token cookie to issue a new access token.
 * This endpoint is called when the access token expires.
 * @access private
 */
const refreshToken = expressAsyncHandler(async (req, res, next) => {
    try {
        const incomingRefreshToken = req.cookies?.refreshToken;
        if (!incomingRefreshToken) {
            return res.status(401).json({ message: "Unauthorized, Refresh token not found" });
        }
        let decoded;
        try {
            decoded = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
        } catch (error) {
            clearRefreshCookie(res);
            return res.status(401).json({ message: "Unauthorized, Invalid refresh token" });
        }
        const user = await UserModel.findById(decoded.id).select("+refreshToken");
        if (!user || user.refreshToken !== incomingRefreshToken) {
            clearRefreshCookie(res);
            return res.status(401).json({ message: "Unauthorized, Invalid refresh token" });
        }
        // token rotation: revoke the old refresh token and issue a new one
        const newAccessToken = generateAccessToken(user._id);
        const newRefreshToken = generateRefreshToken(user._id);
        user.refreshToken = newRefreshToken;
        await user.save({ validateBeforeSave: false });
        setRefreshCookie(res, newRefreshToken);
        res.status(200).json({
            accessToken: newAccessToken,
        });
    } catch (error) {
        console.log("Error in refresh token controller: ", error);
        next(error);
    }
});

/**
 * @checkMe GET /api/auth/check
 * @description check if user is logged in
 * @access private
 */
const checkMe = expressAsyncHandler(async (req, res, next) => {
    try {
        res.status(200).json({
            user: req.user,
        });
    } catch (error) {
        console.log("Error in check me controller: ", error);
        next(error);
    }
});


/**
 * @logout POST /api/auth/logout
 * @description logout a user
 * @access private
 */
const logout = expressAsyncHandler(async (req, res, next) => {
    try {
        const incomingRefreshToken = req.cookies?.refreshToken;
        if (incomingRefreshToken) {
            const user = await UserModel.findOne({ refreshToken: incomingRefreshToken }).select("+refreshToken");
            if (user) {
                user.refreshToken = null;
                await user.save({ validateBeforeSave: false });
            }
        }
        clearRefreshCookie(res);
        res.status(200).json({
            message: "Logged out successful",
        });
    } catch (error) {
        console.log("Error in logout controller: ", error);
        next(error);
    }
});

export { signup, login, checkMe, refreshToken, logout };