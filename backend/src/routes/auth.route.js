import express from "express"
import { checkMe, login, logout, refreshToken, signup } from "../controllers/auth.controller.js"
import { isAuth } from "../middleware/auth.middleware.js"

const router = express.Router()

router.post('/signup', signup)
router.post('/login', login)
router.get('/check-me', isAuth, checkMe)
router.get("/refresh-token", refreshToken);
router.get("/logout", logout);

export default router;