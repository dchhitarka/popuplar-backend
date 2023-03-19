const { errors } = require("../handlers/errorHandlers");
const Post = require("../models/Post");
const PostComments = require("../models/PostComments");
const PostLiked = require("../models/PostLiked");
const PostSaved = require("../models/PostSaved");
const User = require("../models/User");
const Followers = require("../models/UserFollowers");

exports.getProfile = async (req, res) => {
    let user = await User.findOne({_id: req.user._id});
    res.json({status: "success", data: {user}});
}

exports.updateProfile = async (req, res) => {
    let user = await User.findOne({_id: req.user._id});
    Object.keys(req.body).forEach(key => {
        if(key && key != '')
        user[key] = req.body[key]
    });
    user.save();
    return res.json({
        status: "success",
        data: {
            user,
        }
    })
}

exports.deleteProfile = async (req, res) => {
    let user = await User.findOneAndDelete({_id: req.user._id});
    user ? res.status(201).json({status: "success", message: "Account deleted!"}) :
        res.status(500).json({status: "error", error: "Something went wrong! Try again.", type: "UserDeletionError"});
}

exports.followUser = async (req, res) => {
    if(!req.body?.userId || req.body.userId.length === 0){
        return res.status(400).json(errors(err, 'userIdNotFound'));
    }
    let userId = req.body.userId;
    let followerRecords = await Followers.findOne({userId: userId, followerId: req.user._id});

    if(followerRecords != null || followerRecords != undefined) return res.status(403).json({
        status: "error",
        type: "DuplicateFollowError",
        error: "User already followed",
    });
    let user = await User.findOne({_id: userId});
    let follower = await Followers.create({userId: userId, followerId: req.user._id});
    follower.save();
    req.user.following += 1;
    user.followers += 1;
    req.user.save(); 
    user.save();
    return res.status(201).json({
        status: "success",
        message: `Following ${user.name}`,
        data: {
            userFollowers: user.followers,
            myFollowing: req.user.following,
        }
    })
}

exports.unFollowUser = async (req, res) => {
    if(!req.body?.userId || req.body.userId.length === 0){
        return res.status(400).json(errors(err, 'userIdNotFound'));
    }
    let userId = req.body.userId;
    let followerRecords = await Followers.findOne({userId: userId, followerId: req.user._id});
    if(followerRecords == null || followerRecords == undefined) return res.status(403).json({
        status: "error",
        type: "NotFollowingError",
        error: "Unable to unfollow as you are not following the user",
    });
    let user = await User.findOne({_id: userId});
    followerRecords.delete();
    req.user.following -= 1;
    user.followers -= 1;
    req.user.save(); 
    user.save();
    return res.status(201).json({
        status: "success",
        message: `Unfollowed ${user.name}`,
        data: {
            userFollowers: user.followers,
            myFollowing: req.user.following,
        }
    })
}

exports.getSavedPosts = (req, res) => {
    let savedPostIds = PostSaved.find({"userId": req.user._id});
    let posts = Post.find({_id: { $in: savedPostIds }});
    return res.json({
        status: "success",
        data: { posts }
    });
}

exports.getLikedPosts = (req, res) => {
    let likedPostIds = PostLiked.find({"userId": req.user._id});
    let posts = Post.find({_id: { $in: likedPostIds }});
    return res.json({
        status: "success",
        data: { posts }
    });
}

exports.getCommentedPosts = (req, res) => {
    let commentedPostIds = PostComments.find({"userId": req.user._id});
    let posts = Post.find({_id: { $in: commentedPostIds }});
    return res.json({
        status: "success",
        data: { posts }
    });
}