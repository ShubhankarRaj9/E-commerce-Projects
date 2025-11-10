const db = require('../database/database.js');
const mongoose = require('mongoose');

const shippingInfoSchema = new mongoose.Schema({
  order_id: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true, unique: true },
  full_name: { type: String, required: true },
  state: { type: String, required: true },
  city: { type: String, required: true },
  country: { type: String, required: true },
  address: { type: String, required: true },
  zipcode: { type: String, required: true },
  phone: { type: String, required: true },
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model("ShippingInfo", shippingInfoSchema);