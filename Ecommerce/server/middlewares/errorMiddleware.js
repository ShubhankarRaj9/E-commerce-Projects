class ErrorHandler extends Error {
    constructor(message,statusCode) {
        super(message);
        this.statusCode = statusCode;
    }
};

const errorMiddleware = (err,req,res,next) => {
    err.message = err.message || "Internal Server Error";
    err.statusCode = err.statusCode || 500;
    if(err.code === 11000) {
        err.message = `Duplicate field value entered for ${Object.keys(err.keyValue)} field, Please use another value!`;
        err = new ErrorHandler(err.message,400);
    }
    if(err.name === "JSONWEBTOKENError") {
        const message = "JSON Web Token is invalid, Try again!";
        err = new ErrorHandler(message,400);
    }
    if(err.name === "TokenExpiredError") {
        const message = "JSON Web Token is expired, Try again!";
        err = new ErrorHandler(message,400);
    }

    console.log(err);
    const errorMessage = err.errors ? Object.values(err.errors).map(value => value.message).join(' ') : err.message;
    
    return res.status(err.statusCode).json({
        success: false,
        message: errorMessage
    });

}
module.exports ={ ErrorHandler, errorMiddleware};