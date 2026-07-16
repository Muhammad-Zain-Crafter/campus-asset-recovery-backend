import { Router } from "express";
import { reportAsset } from "../controllers/assetController.js";
import { upload } from "../middlewares/upload.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = Router()

router.route("/report-asset").post(
    protect, upload.single("image"), reportAsset
)

export default router