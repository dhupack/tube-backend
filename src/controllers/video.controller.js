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
        matchStage.title = { $regex: query, $options: "i" }; 
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
                localField: "owner", 
                foreignField: "_id",
                as: "owner"
            }
        },
        { $unwind: "$owner" },              
        { $sort: sortStage }                 
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
    const { videoId } = req.params
    
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    if (video.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not allowed to update this video");
    }

    const { title, description } = req.body;

    if (title) video.title = title;
    if (description) video.description = description;

    const thumbnail = req.files?.thumbnail;
    if (thumbnail) {
        const uploadedThumbnail = await uploadOnCloudinary(thumbnail.tempFilePath, "image");

        if (!uploadedThumbnail || !uploadedThumbnail.secure_url) {
            throw new ApiError(500, "Thumbnail upload failed");
        }

        video.thumbnail = uploadedThumbnail.secure_url;
    }

    await video.save();

    return res
    .status(200)
    .json(
        new ApiResponse(200, video, "Video updated successfully")
    );
})

const deleteVideo = asyncHandler(async (req, res) => {

    const { videoId } = req.params

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    if (video.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not allowed to delete this video");
    }


    await video.deleteOne();

    return res
    .status(200)
    .json(
        new ApiResponse(200, null, "Video deleted successfully")
    );
})

const togglePublishStatus = asyncHandler(async (req, res) => {

    const { videoId } = req.params;

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    if (video.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not allowed to change publish status of this video");
    }

    video.isPublished = !video.isPublished;

    await video.save();

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