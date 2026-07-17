import { Router } from "express";
import {
  createClaim,
  getMyClaims,
  getClaimsForAsset,
  getAllClaims,
  getPendingClaims,
  approveClaim,
  rejectClaim,
  deleteClaim,
} from "../controllers/claimController.js";
import { protect } from "../middlewares/authMiddleware.js";
import { adminOnly } from "../middlewares/adminMiddleware.js";

const router = Router();

router.route("/:assetId/claim").post(protect, createClaim);
router.route("/my-claims").get(protect, getMyClaims);
router.route("/asset/:assetId").get(protect, getClaimsForAsset);
router.route("/get-allClaims").get(protect, adminOnly, getAllClaims);
router.route("/get-pendingClaims").get(protect, adminOnly, getPendingClaims);
router.route("/:id/approve").patch(protect, adminOnly, approveClaim);
router.route("/:id/reject").patch(protect, adminOnly, rejectClaim);
router.route("/:id").delete(protect, deleteClaim);

export default router;