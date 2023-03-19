const mongoose = require('mongoose');
const User = require('./User');
mongoose.Promise = global.Promise;

const Followers = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: User,
    },
    followerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: User,
    }
});

module.exports = mongoose.model("Followers", Followers);
