const mongoose = require('mongoose');
const Post = require('./Post');
const User = require('./User');

const Comment = new mongoose.Schema({
    postId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: Post,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: User,
    },
    comment: {
        type: String,
        required: true
    },
    createAt: {
        type: Date,
        default: Date.now,
    },
    upVote: {
        type: Number,
        default: 0
    },
    downVote: {
        type: Number,
        default: 0
    },
    replies: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment',
    }]
});

module.exports = mongoose.model('PostComments', Comment);