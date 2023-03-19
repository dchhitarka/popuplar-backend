const mongoose = require('mongoose');
const User = require('./User');

const PostSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    slug: String,
    content: String,
    images: [String],
    type: String,
    tags: String,
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: User,
    },
    createdAt: {
        type: Date,
        default: Date.now,
        required: true,
    },
    updatedAt: {
        type: Date,
    },
    owner: mongoose.Schema.Types.Mixed,
    likes: {
        type: Number,
        default: 0,
    },
    comments: {
        type: Number,
        default: 0,
    },
});

PostSchema.pre('save', function(next) {
    this.slug = this.title.toLowerCase().split(" ").join("-");
    next();
});

// PostSchema.pre('find', function(next) {
//     this.createdBy = User.find({_id: this.userId});
//     next();
// });

module.exports = mongoose.model('Post', PostSchema);