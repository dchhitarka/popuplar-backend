const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const md5 = require('md5');
const validator = require('validator');
const mongodbErrorHandler = require('mongoose-mongodb-errors');
const passportLocalMongoose = require('passport-local-mongoose');

const User = new mongoose.Schema({
    email: {
        type: String,
        unique: true,
        lowercase: true,
        trim: true,
        required: 'Please supply an email address'
    },
    name: {
        type: String,
        unique: true,
        required: 'Please supply an name',
        trim: true,
    },
    username: {
        type: String,
        unique: true,
    },
    avatar: {
        type: String,
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    followers: {
        type: Number,
        default: 0,
    },
    following: {
        type: Number,
        default: 0,
    },
    phone: String,
    profession: String,
    interests: [String],
    hobbies: [String],
    bio: String,
    country: String,
});

User.pre('save', function(next) {
    const hash = md5(this.email);
    this.avatar = `https://gravatar.com/avatar/${hash}?s=200`;
    this.username = this.name.toLowerCase().split(' ').join('_');
    next();
  });
// userSchema.virtual('gravatar').get(function(){
// })

User.plugin(passportLocalMongoose, {usernameField: 'email'})
User.plugin(mongodbErrorHandler);

module.exports = mongoose.model("User", User);
