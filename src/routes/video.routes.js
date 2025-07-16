import { Router } from 'express';
import {
    deleteVideo,
    getAllVideos,
    getVideoById,
    publishAVideo,
    togglePublishStatus,
    updateVideo,
} from "../controllers/video.controller.js"
import {verifyJWT} from "../middlewares/auth.middleware.js"
import {upload} from "../middlewares/multer.middleware.js"

const router = Router()

router.use(verifyJWT) // Apply verifyJWT middleware to all routes in this file

router.route("/get-videos").get(getAllVideos)
router.route("/upload-video").post(
    upload.fields([
            {
                name: "videoFile",
                maxCount: 1,
            },
            {
                name: "thumbnail",
                maxCount: 1,
            },
            
        ]),
        publishAVideo
)

router.route("/getvideobyid").get(getVideoById)
router.route("/delete-video").delete(deleteVideo)
router.route("/thumbnail").patch(upload.single("thumbnail"), updateVideo)
router.route("/toggle/publish/:videoId").patch(togglePublishStatus)

export default router