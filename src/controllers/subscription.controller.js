import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    const subscriberId = req.user._id;

    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channel ID");
    }

    if (channelId.toString() === subscriberId.toString()) {
        throw new ApiError(400, "You cannot subscribe to your own channel");
    }

    const existingSubscription = await Subscription.findOne({
        subscriber: subscriberId,
        channel: channelId
    });

    if (existingSubscription) {
        await existingSubscription.deleteOne();
        return res
        .status(200)
        .json(
            new ApiResponse(200, null, "Unsubscribed successfully")
        )
    }

    await Subscription.create({
        subscriber: subscriberId,
        channel: channelId
    });

    return res
    .status(201)
    .json(
        new ApiResponse(201, null, "Subscribed successfully")
    )

})      

const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channel ID");
    }

    const subscribers = await Subscription.find({ channel: channelId })
        .populate("subscriber", "username fullName avatar");

    return res
    .status(200)
    .json(
        new ApiResponse(200, subscribers.map(s => s.subscriber), "Subscribers fetched")
    )
})

const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params
    if (!isValidObjectId(subscriberId)) {
        throw new ApiError(400, "Invalid subscriber ID");
    }

    const channels = await Subscription.find({ subscriber: subscriberId })
        .populate("channel", "username fullName avatar");

    return res
    .status(200)
    .json(
        new ApiResponse(200, channels.map(c => c.channel), "Subscribed channels fetched")
    )
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}