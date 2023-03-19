const passport = require('passport');
const crypto = require('crypto');
const User = require("../models/User");
const { validationResult } = require('express-validator');
// const mail = require("../handlers/mail");


exports.register = async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(422).json({ status: "error", error: errors.array(), type: "InputValidationError" })
    }
    try{
        const user = new User({email: req.body.email, name: req.body.name});
        await User.register(user, req.body.password); 
    } catch (err){
        if(err.name === 'UserExistsError')
            return res.status(409).json({ status: "error", type: err.name, error: err.message });
        return res.status(500).json({ status: "error", type: err.name, error: err.message });
    }
    return res.status(201).json({status: "success", message: "You have registered successfully!"});
}

exports.login = (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(422).json({ status: "error", error: errors.array(), type: "InputValidationError" })
    }
    passport.authenticate('local', function(err, user, info) {
        if (err) return res.status(500).json({status: "error", type: err.name, error: err.message});
        if(!user) return res.status(404).json({ status: "error", type: info?.name ?? 'UserNotFoundError', error: "No such user exists"});
        req.logIn(user, function(err) {
            return err ? 
                  res.status(404).json({status: "error", type: "LoginError", error: err})
                : res.json({data: {user}, status: "success", message: "Logged in successfully!"});
        });
    })(req, res, next);
}

exports.logout = (req, res) =>{
    req.logout();
    return res.json({message: 'You are logged out now!', status:"success"});
}

exports.isLoggedIn = (req, res, next) => {
    if(req.isAuthenticated()){
        return next();
    }
    return res.status(401).json({type: "UnAuthenticatedUserError", error: 'You need to be logged in to do that.', status:"error"});
}

exports.isAuthenticated = (req, res) => {
    if(req.isAuthenticated()){
        return res.json({message: 'You are logged in!', status:"success", data: {user: req.user}});
    }
    return res.status(401).json({type: "SessionExpiredError", error: 'Session Expired!', status:"error"});
}
exports.forgot = async (req, res) => {
    const user = await User.findOne({ email: req.body.email});
    if(!user){
        req.flash('error', "No account with that email exists.");
        return res.redirect('/login');
    }
    user.resetPasswordToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordExpires = Date.now() + 3600000;
    await user.save();

    const resetURL = `http://${req.headers.host}/account/reset/${user.resetPasswordToken}`;
    // await mail.send({
    //     user,
    //     subject: 'Password Reset',
    //     resetURL,
    //     filename: 'password-reset'
    // })
    req.flash('success', `You have been emailed a password reset link!`);
    res.redirect('/login');
}


exports.reset = async (req, res) => {
    const user = await User.findOne({
        resetPasswordToken: req.params.token,
        resetPasswordExpires: {$gt: Date.now()}
    });
    if(!user){
        req.flash('error', 'Password reset is invalid or has expired!');
        return res.redirect('/login');
    }
    res.render('reset', {title: "Reset Your Password"});
}

exports.confirmedPasswords = (req, res, next) => {
    if(req.body.password === req.body["password-confirm"]){
        return next();
    }
    req.flash('error', "Password do not match!");
    res.redirect('back');
}

exports.updatePassowrd = async (req, res) => {
    const user = await User.findOne({
        resetPasswordToken: req.params.token,
        resetPasswordExpires: {$gt: Date.now()}
    })
    if(!user){
        req.flash('error', 'Password reset is invalid or has expired!');
        return res.redirect('/login');
    }
    const setPassword = promisify(user.setPassword, user);
    await setPassword(req.body.password);
    user.resetPasswordExpires = undefined;
    user.resetPasswordToken = undefined;
    const updatedUser = await user.save();
    await req.login(updatedUser);
    req.flash("success", "Your password has been reset!");
    res.redirect('/');
}