import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { getAdminJobs, getAllJobs, getJobById, postJob, deleteJob } from "../controllers/job.controller.js";
import { saveJobForLater, unsaveJobForLater, getSavedJobs } from "../controllers/user.controller.js";

const router = express.Router();

router.route("/post").post(isAuthenticated, postJob);
router.route("/get").get(getAllJobs);
router.route("/getadminjobs").get(isAuthenticated, getAdminJobs);
router.route("/get/:id").get(getJobById);
router.route("/save/:id").post(isAuthenticated, saveJobForLater);
router.route("/unsave/:id").delete(isAuthenticated, unsaveJobForLater);
router.route("/saved").get(isAuthenticated, getSavedJobs);
router.route("/delete/:id").delete(isAuthenticated, deleteJob);

export default router;

