import { Router } from "express"
import { register, login, getProfile, logout, forgotPassword, resetPassword } from "../controllers/userController.js"
import { protect } from "../middlewares/authMiddleware.js"

const router = Router();

router.route("/register").post(
    register
)
router.route("/login").post(
    login
)
router.route("/getProfile").get(
    protect, getProfile
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