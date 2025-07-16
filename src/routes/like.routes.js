import { Router } from 'express';
import {
    getLikedVideos,
    toggleCommentLike,
    toggleVideoLike,
    toggleTweetLike,
} from "../controllers/like.controller.js"
import {verifyJWT} from "../middlewares/auth.middleware.js"

const router = Router()
router.use(verifyJWT)

router.route("/togglevideolike").post(toggleVideoLike)
router.route("/togglecommentlike").post(toggleCommentLike)
router.route("/toggletweetlike").post(toggleTweetLike)
router.route("/getvideolikes").get(getLikedVideos)

export default router