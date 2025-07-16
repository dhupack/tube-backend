import { Router } from 'express';
import {
    createTweet,
    deleteTweet,
    getUserTweets,
    updateTweet,
} from "../controllers/tweet.controller.js"
import {verifyJWT} from "../middlewares/auth.middleware.js"

const router = Router()
router.use(verifyJWT)

router.route("/createtweet").post(createTweet)
router.route("/getusertweets").get(getUserTweets)
router.route("/updatetweet").patch(updateTweet)  // DOUBT
router.route("/deletetweet").delete(deleteTweet)

export default router