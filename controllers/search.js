const Post = require('../models/Post');
const { errors } = require('../handlers/errorHandlers');
const { check } = require('express-validator');
const User = require('../models/User');

// TODO: Implement it later, as without title, no meaning of having this
exports.getPosts = async (req, res) => {
    const posts = await Post.find({});
    return res.json({
        status: "success",
        data: { posts }
    })
}

exports.getUsers = async (req, res) => {
    const users = await User.find({"$or":[{username: {$in: req.params.q}, name: {$in: req.params.q}}]});
    return res.json({
        status: "success",
        data: { users }
    })
}