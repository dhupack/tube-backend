import { Router } from 'express';
import {
    getSubscribedChannels,
    getUserChannelSubscribers,
    toggleSubscription,
} from "../controllers/subscription.controller.js"
import {verifyJWT} from "../middlewares/auth.middleware.js"

const router = Router()
router.use(verifyJWT)

router.route("/getsubscribedchannel").get(getSubscribedChannels)
router.route("/togglesubscription").post(toggleSubscription)

router.route("/getuserchannelsubscribers").get(getUserChannelSubscribers)

export default router