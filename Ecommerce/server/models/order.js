const db = require('../database/database.js');
const mongoose = require('mongoose');
const product = require('./product.js');


const orderSchema = new mongoose.Schema({
  orderId:{ type:String,unique:true,required:true,},
  paymentId:{type:String,default:null},
  buyer_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  products: [
    {
      product_id: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
      quantity: { type: Number, required: true, min: 1 },
      price: { type: Number, required: true, min: 0 },
    },  
  ],
  total_price: { type: Number, required: true, min: 0 },
  tax_price: { type: Number, required: true, min: 0 },
  shipping_price: { type: Number, required: true, min: 0 },
  order_status: {
    type: String,
    enum: ["Processing", "Shipped", "Delivered", "Cancelled"],
    default: "Processing",
  },
  paid_at: { type: Date },
  created_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Order", orderSchema);



      
            
         