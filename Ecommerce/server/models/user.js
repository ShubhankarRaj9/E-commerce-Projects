const db = require('../database/database.js');
const mongoose = require('mongoose');


const userSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true,
        trim: true,
    },
    email:{
        type: String,
        required: true,
        unique: true,
        lowercase: true,
    },
    password:{
        type: String,
        required: true,
    },
    role:{
        type: String,
        default: "user",
        enum: ["user","admin"]
    },
    avatar:{
        type:Object,
        default:{},
    },
    reset_password:{
        type: String,
    },
    reset_password_expire:{
        type: Date,
    },
    created_at:{
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('User', userSchema);
