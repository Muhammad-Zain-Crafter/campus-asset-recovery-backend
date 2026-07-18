import { Router } from "express";
import { reportAsset, getAllAssets, getAssetById, getMyAssets, updateAsset, deleteAsset, approveAsset, getPendingAssets } from "../controllers/assetController.js";
import { upload } from "../middlewares/upload.js";
import { protect } from "../middlewares/authMiddleware.js";
import { adminOnly } from "../middlewares/adminMiddleware.js";

const router = Router()

router.route("/report-asset").post(
    protect, upload.single("image"), reportAsset
)
router.route("/get-allAssets").get(
    getAllAssets
)
router.route("/getAsset/:id").get(
    getAssetById
)
router.route("/get-myAssets").get(
    protect, getMyAssets
)
router.route("/update-asset/:id").put(
    protect, updateAsset
)
router.route("/delete-asset/:id").delete(
    protect, deleteAsset
)
router.route('/:id/approve').patch(
    protect, adminOnly, approveAsset
)
router.route('/get-pendingAssets').get(
    protect, adminOnly, getPendingAssets
)
export default router