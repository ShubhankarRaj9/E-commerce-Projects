const {ErrorHandler} = require('../middlewares/errorMiddleware');
const catchAsyncError = require('../middlewares/catchAsyncError');
const User = require('../models/user.js');
const bcrypt = require('bcryptjs');
const sendToken = require('../utils/jwtToken');
const sendEmail = require('../utils/sendEmail.js');
const getResetPasswordToken = require('../utils/generateResetPasswordToken.js');
const generateEmailTemplate = require('../utils/generateForgotPasswordEmailTemplate.js');
const crypto = require('crypto');
const cloudinary = require('cloudinary').v2;


const register = catchAsyncError(async (req,res,next) => {
    const {name,email,password} = req.body;
    if(!name || !email || !password) {
        return next(new ErrorHandler("Please provide all required fields. ", 400));
    }
    if(!password) {
        return next(new ErrorHandler("Password must be between 6 and 16 character long ",400));
    }

    const isAlreadyRegistered = await User.findOne({ email });
    if(isAlreadyRegistered) {
    return next(new ErrorHandler("User already registered with this email. ",400));
    }
    const hashedPassword = await bcrypt.hash(password,10);
    const user = await User.create({
        email,
        name,
        password:hashedPassword,
    });
    sendToken(user, 201, "User Registered Successfully",res);
})




const login = catchAsyncError(async(req,res,next) => {
    const {email,password} = req.body;
    if(!email || !password) {
        return next(new ErrorHandler("Please provide all required fields. ", 400));
    }
    const user = await User.findOne({ email }).select("+password");
    if(!user) {
        return next(new ErrorHandler("Invalid Email or Password",401));
    }
    const isPasswordMatched = await bcrypt.compare(password,user.password);
    if(!isPasswordMatched) {
        return next(new ErrorHandler("Invalid Password",401));
    }
    sendToken(user,200,"User Logged In Successfully",res);
})




const getUser = catchAsyncError((req,res,next) => {
    const {user} = req;
    res.status(200).json({
        success:true,
        user
    });
})



const logout = catchAsyncError((req,res,next) => {
    res.status(200).cookie("token","",{
        expires:new Date(Date.now()),
        httpOnly:true,
    }).json({
        success:true,
        message:"User Logged Out Successfully",
    });
});




const forgotPassword = catchAsyncError(async(req,res,next) => {
    const {email} = req.body;
    const {frontendUrl} = req.query;

    let userRes = await User.findOne({email});
    if(!userRes) {
        return next(new ErrorHandler("User not found with this email",404));
    }
    const { resetToken, hashedToken, tokenExpiry } = getResetPasswordToken();
    userRes.reset_password = hashedToken;
    userRes.reset_password_expire = tokenExpiry;
    await userRes.save({ validateBeforeSave: false });
    const resetUrl = `${frontendUrl}/password/reset/${resetToken}`;
    const message = generateEmailTemplate(resetUrl);
    try {
        await sendEmail({
            email:userRes.email,
            subject:"Ecommerce Password Recovery",
            message,
        });
        res.status(200).json({
            success:true,
            message:`Email sent to ${userRes.email} successfully`,
        });
    }
    catch(err) {
        userRes.reset_password = null;
        userRes.reset_password_expire = null;
        await userRes.save({ validateBeforeSave: false });
        return next(new ErrorHandler(err.message,500));
    }
});




const resetPassword = catchAsyncError(async(req,res,next) => {
    const {token} = req.params;
    const resetPasswordToken = crypto.createHash("sha256").update(token).digest("hex");
    const user = await User.findOne
    ({
        reset_password:resetPasswordToken,
        reset_password_expire: { $gt: Date.now() },
    });
    if(!user) {
        return next(new ErrorHandler("Reset Password Token is invalid or has been expired",400));
    }
    const {password,confirmPassword} = req.body;
    if(password !== confirmPassword) {
        return next(new ErrorHandler("Password and Confirm Password do not match",400));
    }
    if(!password || !confirmPassword ) {
        return next(new ErrorHandler("Password must be between 6 and 16 character long ",400));
    }
    user.password = await bcrypt.hash(password,10);
    user.reset_password = null;
    user.reset_password_expire = null;
    await user.save();
    sendToken(user,200,"Password Reset Successfully",res);  
});




const updatePassword = catchAsyncError(async(req,res,next) => {
    const {oldPassword,newPassword,confirmNewPassword} = req.body;
    if(!oldPassword || !newPassword || !confirmNewPassword) {
        return next(new ErrorHandler("Please provide all required fields",400));
    }
    const {user} = req;
    const userData = await User.findById(user._id).select("+password");
    if(!userData) {
        return next(new ErrorHandler("User not found",404));
    }

    const isPasswordMatched = await bcrypt.compare(oldPassword,userData.password);
    if(!isPasswordMatched) {
        return next(new ErrorHandler("Old Password is incorrect",400));
    }
    if(newPassword !== confirmNewPassword) {
        return next(new ErrorHandler("New Password and Confirm New Password do not match",400));
    }

    userData.password = await bcrypt.hash(newPassword,10);
    await userData.save();
    // sendToken(userData,200,"Password Updated Successfully",res);
    res.status(200).json({
        success:true,
        message:"Password Updated Successfully",
    });
});





const updateProfile = catchAsyncError(async(req,res,next) => {
    const {name,email} = req.body;
    if(!name || !email) {
        return next(new ErrorHandler("Please provide all required fields",400));
    }
    if(name.trim() === "" || email.trim() === "") {
        return next(new ErrorHandler("Name and Email cannot be empty",400));
    }
    let avatarData = {};
    if(req.files && req.files.avatar) {
        const {avatar} = req.files;
        if(req.user?.avatar?.public_id){
            await cloudinary.uploader.destroy(req.user.avatar.public_id);
        }
       const newProfileImage = await cloudinary.uploader.upload(avatar.tempFilePath,{
        folder:"avatar",
        width:150,
        crop:"scale",
       });
       avatarData = {
            public_id:newProfileImage.public_id,
            url:newProfileImage.secure_url,
       };
    }

     const updatedUserData = Object.keys(avatarData).length === 0
        ? { name, email, user_id: req.user._id }
        : { name, email, avatar: avatarData, user_id: req.user._id };


    const user = await User.findByIdAndUpdate(req.user._id, updatedUserData, {
        new: true,
        runValidators: true,
        useFindAndModify: false,
    });

    res.status(200).json({
        success:true,
        message:"Profile updated successfully",
        user
    })

});

module.exports = {register,login,getUser,logout,forgotPassword,resetPassword,updatePassword,updateProfile};