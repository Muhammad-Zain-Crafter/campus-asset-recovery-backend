import { Router } from "express"
import { register, login, getProfile, updateProfile, changePassword, logout, forgotPassword, resetPassword } from "../controllers/userController.js"
import { protect } from "../middlewares/authMiddleware.js"
import { upload } from "../middlewares/upload.js";

const router = Router();

router.route("/register").post(
  upload.single("profileImage"),
  register
);
router.route("/login").post(
    login
)
router.route("/getProfile").get(
    protect, getProfile
)
router.route("/updateProfile").put(
  protect,
  upload.single("profileImage"),
  updateProfile
);
router.route("/change-password").post(
    protect, changePassword
)
router.route("/logout").post(
    protect, logout
)
router.route("/forgot-password").post(
    forgotPassword
)
router.route("/reset-password/:token").post(
    resetPassword
)
export default router