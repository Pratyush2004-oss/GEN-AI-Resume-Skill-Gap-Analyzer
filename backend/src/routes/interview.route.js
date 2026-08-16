import express from "express";
import { deleteInterviewReport, generateInterviewReportController, generateResumePDFController, getAllInterviewReportsController, getSingleInterviewReportController } from "../controllers/interview.controller.js";
import { isAuth } from "../middleware/auth.middleware.js";
import upload from "../middleware/file.middleware.js";
const router = express.Router();

/**
 * @route POST /api/interview
 * @description generate new interview report on the basis of user self description, resume pdf and job description
 * @access private
 */
router.post('/generate', isAuth, upload.single("resume"), generateInterviewReportController);

/**
 * @route GET /api/interview
 * @description get all interview reports of a user
 * @access private
 */
router.get('/reports', isAuth, getAllInterviewReportsController);

/**
 * @route GET /api/interview/:id
 * @description get a single interview report of a user
 * @params id
 * @access private
 */
router.get('/report/:id', isAuth, getSingleInterviewReportController);

/**
 * @route DELETE /api/interview/:id
 * @description delete a single interview report of a user
 * @params id
 * @access private
 */
router.delete('/report/:id', isAuth, deleteInterviewReport);

/**
 * @route POST /api/interview/resume/pdf/:id
 * @description Generate tailored resume according to the job description
 * @params id
 * @access private
 */
router.get('/resume/pdf/:id', isAuth, generateResumePDFController);
export default router;