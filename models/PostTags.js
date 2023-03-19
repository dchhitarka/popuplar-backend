const mongoose = require('mongoose');
const Post = require('./Post');
const User = require('./User');

const PostTags = new mongoose.Schema({
    tag: {
        type: String,
        unique: true
    },
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

module.exports = mongoose.model('PostTags', PostTags);