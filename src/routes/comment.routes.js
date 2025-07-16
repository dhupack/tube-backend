import { Router } from 'express';
import {
    addComment,
    deleteComment,
    getVideoComments,
    updateComment,
} from "../controllers/comment.controller.js"
import {verifyJWT} from "../middlewares/auth.middleware.js"

const router = Router()

router.use(verifyJWT)

router.route("/getvideocomments").get(getVideoComments)
router.route("/addcomment").post(addComment)
router.route("/deletecomment").delete(deleteComment)
router.route("/updatecomment").patch(updateComment)  // DOUBT

export default router