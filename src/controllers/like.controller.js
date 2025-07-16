import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    const userId = req.user._id;

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    const existingLike = await Like.findOne({ video: videoId, likedby: userId });

    if (existingLike) {
        await existingLike.deleteOne();
        return res
        .status(200)
        .json(
            new ApiResponse(200, null, "Video unliked"));
    }

    await Like.create({ video: videoId, likedby: userId });

    return res
    .status(201)
    .json(
        new ApiResponse(201, null, "Video liked"));

})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    const userId = req.user._id;

    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid comment ID");
    }

    const existingLike = await Like.findOne({ comment: commentId, likedby: userId });

    if (existingLike) {
        await existingLike.deleteOne();
        return res
        .status(200)
        .json(
            new ApiResponse(200, null, "Comment unliked"));
    }

    await Like.create({ comment: commentId, likedby: userId });

    return res
    .status(201)
    .json(
        new ApiResponse(201, null, "Comment liked"));

})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    const userId = req.user._id;

    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweet ID");
    }

    const existingLike = await Like.findOne({ tweet: tweetId, likedby: userId });

    if (existingLike) {
        await existingLike.deleteOne();
        return res
        .status(200)
        .json(
            new ApiResponse(200, null, "Tweet unliked")
        );
    }

    await Like.create({ tweet: tweetId, likedby: userId });

    return res
    .status(201)
    .json(
        new ApiResponse(201, null, "Tweet liked")
    );
})

const getLikedVideos = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    const likedVideos = await Like.find({ likedby: userId, video: { $ne: null } })
        .populate("video");

    return res
    .status(200)
    .json(
        new ApiResponse(200, likedVideos.map(like => like.video), "Liked videos fetched successfully")
    );
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}