const jwt = require('jsonwebtoken');

const sendToken= (user,statusCode,message,res) => {
    const token = jwt.sign(
        {
            _id:user._id,
        },
        process.env.JWT_SECRET_KEY,
        {
        expiresIn:process.env.JWT_EXPIRES_IN,
        }
    );
    res.status(statusCode).cookie("token",token,{
        expires:new Date(Date.now() + process.env.COOKIE_EXPIRES_IN*24*60*60*1000),
        httpOnly:true
    }).json({
        success:true,
        user,message,token,
    });
}



module.exports = sendToken;