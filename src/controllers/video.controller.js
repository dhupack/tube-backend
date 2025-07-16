import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    const matchStage = {
        isPublished: true
    };

    if (query) {
        matchStage.title = { $regex: query, $options: "i" }; // case-insensitive search
    }

    if (userId && isValidObjectId(userId)) {
        matchStage.owner = new mongoose.Types.ObjectId(userId);
    }

    const sortStage = {
        [sortBy]: sortType === "asc" ? 1 : -1
    };

    const aggregateQuery = Video.aggregate([
        { $match: matchStage },
        {
            $lookup: {
                from: "users",                // Collection name in MongoDB
                localField: "owner",          // From videos
                foreignField: "_id",          // Match with user _id
                as: "owner"
            }
        },
        { $unwind: "$owner" },               // Convert owner array to object
        { $sort: sortStage }                 // Apply sorting
    ]);

    const options = {
        page: parseInt(page),
        limit: parseInt(limit)
    };

    const result = await Video.aggregatePaginate(aggregateQuery, options);

    return res
    .status(200)
    .json(
        new ApiResponse(200, result, "Videos fetched successfully")
    );
})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description} = req.body
    const videoFile = req.files?.videoFile;
    const thumbnail = req.files?.thumbnail;

    if (!title || !description || !videoFile || !thumbnail) {
        throw new ApiError(400, "All fields (title, description, video, thumbnail) are required");
    }

    const uploadedVideo = await uploadOnCloudinary(videoFile.tempFilePath, "video");

    if (!uploadedVideo || !uploadedVideo.secure_url) {
        throw new ApiError(500, "Video upload to Cloudinary failed");
    }

    const uploadedThumbnail = await uploadOnCloudinary(thumbnail.tempFilePath, "image");

    if (!uploadedThumbnail || !uploadedThumbnail.secure_url) {
        throw new ApiError(500, "Thumbnail upload to Cloudinary failed");
    }

    const newVideo = await Video.create({
        title,
        description,
        videoFile: uploadedVideo.secure_url,
        thumbnail: uploadedThumbnail.secure_url,
        duration: uploadedVideo.duration,
        owner: req.user._id
    });

    return res
    .status(201)
    .json(
        new ApiResponse(201, newVideo, "Video published successfully")
    )
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    const video = await Video.findById(videoId).populate("owner", "username fullName avatar");

    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    if (!video.isPublished && (!req.user || video.owner._id.toString() !== req.user._id.toString())) {
        throw new ApiError(403, "You are not allowed to view this video");
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, video, "Video fetched successfully")
    );
})

const updateVideo = asyncHandler(async (req, res) => {
    // Step 1: Extract video ID from route
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail
    // Step 2: Validate video ID
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    // Step 3: Find the video in DB
    const video = await Video.findById(videoId);

    // Step 4: If video not found, throw error
    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    // Step 5: Check if current user is the owner
    if (video.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not allowed to update this video");
    }

    // Step 6: Extract fields from body (title & description)
    const { title, description } = req.body;

    // Step 7: Update fields only if provided
    if (title) video.title = title;
    if (description) video.description = description;

    // Step 8: Handle optional thumbnail update
    const thumbnail = req.files?.thumbnail;
    if (thumbnail) {
        const uploadedThumbnail = await uploadOnCloudinary(thumbnail.tempFilePath, "image");

        if (!uploadedThumbnail || !uploadedThumbnail.secure_url) {
            throw new ApiError(500, "Thumbnail upload failed");
        }

        video.thumbnail = uploadedThumbnail.secure_url;
    }

    // Step 9: Save updated video in DB
    await video.save();

    // Step 10: Respond to frontend
    return res
    .status(200)
    .json(
        new ApiResponse(200, video, "Video updated successfully")
    );
})

const deleteVideo = asyncHandler(async (req, res) => {
    // Step 1: Extract videoId from URL params
    const { videoId } = req.params
    //TODO: delete video
    // Step 2: Validate the videoId
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    // Step 3: Find the video by ID
    const video = await Video.findById(videoId);

    // Step 4: If video not found, throw error
    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    // Step 5: Check if the logged-in user is the owner
    if (video.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not allowed to delete this video");
    }

    // (Optional) Step 6: If you want to delete from Cloudinary too
    // Note: Only possible if you saved public_id while uploading
    // await cloudinary.v2.uploader.destroy(video.cloudinaryPublicId); // for thumbnail
    // await cloudinary.v2.uploader.destroy(video.cloudinaryVideoPublicId, { resource_type: 'video' });

    // Step 7: Delete the video document
    await video.deleteOne();

    // Step 8: Send success response
    return res
    .status(200)
    .json(
        new ApiResponse(200, null, "Video deleted successfully")
    );
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    // Step 1: Get videoId from URL
    const { videoId } = req.params;

    // Step 2: Validate video ID
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    // Step 3: Find video in database
    const video = await Video.findById(videoId);

    // Step 4: Check if video exists
    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    // Step 5: Check if the logged-in user is the owner
    if (video.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not allowed to change publish status of this video");
    }

    // Step 6: Toggle the publish status
    video.isPublished = !video.isPublished;

    // Step 7: Save the updated video
    await video.save();

    // Step 8: Send response
    return res
    .status(200)
    .json(
        new ApiResponse(200, video, `Video is now ${video.isPublished ? "Published" : "Unpublished"}`)
    );
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}