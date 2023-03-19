const mongoose = require('mongoose');
const Post = require('./Post');
const User = require('./User');

const PostLiked = new mongoose.Schema({
    postId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: Post,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: User,
    },
    createAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('PostLiked', PostLiked);