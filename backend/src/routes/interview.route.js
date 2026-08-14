import express from "express";
import { generateInterviewReportController } from "../controllers/interview.controller.js";
import { isAuth } from "../middleware/auth.middleware.js";
import upload from "../middleware/file.middleware.js";
const router = express.Router();

/**
 * @route POST /api/interview
 * @description generate new interview report on the basis of user self description, resume pdf and job description
 * @access private
 */
router.post('/', upload.single("resume"), generateInterviewReportController);

export default router;
