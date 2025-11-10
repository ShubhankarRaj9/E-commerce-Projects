const jwt = require("jsonwebtoken");
const catchAsyncError = require('./catchAsyncError');
const {ErrorHandler} = require('./errorMiddleware');

const User = require('./../models/user');

const isAuthenticated = catchAsyncError(async(req,res,next)=>{
    const token = req.cookies.token || req.header("Authorization")?.replace("Bearer ", "");
    if(!token) {
        return next(new ErrorHandler("Please login to access this resource",401));
    }
    const decoded = jwt.verify(token,process.env.JWT_SECRET_KEY);
    const user = await User.findById(decoded._id);
    if(!user){
        return next(new ErrorHandler("User not Found",404));
    }
    req.user = user;
    next();
});

const authorizedRoles = (...roles) => {
    return (req,res,next) => {
        if(!roles.includes(req.user.role)) {
            return next(new ErrorHandler(`Role: ${req.user.role} is not allowed to access this resource`,403));
        }
        next();
    }
};
module.exports = {isAuthenticated, authorizedRoles};