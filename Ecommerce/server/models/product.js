const db = require('../database/database.js');
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
         type: String,
         required: true 
    },
    price: { 
        type: Number, 
        required: true, 
        min: 0 
    },
    category: { 
        type: String, 
        required: true
    },
    ratings: { 
        type: Number,
        default: 0,
        min: 0, 
        max: 5 
    },
    images: [{ 
        url: { type: String, required: true },
        public_id: { type: String, required: true }
     }],
    stock: { 
        type: Number,
        required: true,
        min: 0 
    },
    created_by: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: "admin",
        required: true
    },
    created_at: {
        type: Date,
        default: Date.now
    }
});
module.exports = mongoose.model('Product', productSchema);