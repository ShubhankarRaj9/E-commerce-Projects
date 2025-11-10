const db = require('../database/database.js');
const mongoose = require('mongoose');


const orderItemSchema = new mongoose.Schema({
  order_id: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true },
  product_id: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true, min: 0 },
  image: { type: String },
  title: { type: String, required: true },
  created_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model("OrderItem", orderItemSchema);