const db = require('../database/database.js');
const mongoose = require('mongoose');


const paymentSchema = new mongoose.Schema({
  order_id: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true, unique: true },
  payment_type: {
    type: String,
    enum: ["Online"],
    required: true,
  },
  payment_status: {
    type: String,
    enum: ["Paid", "Pending", "Failed"],
    required: true,
    default:"Pending"
  },
  payment_intent_id: { type: String, unique: true, sparse: true },
  razorpay_payment_id: { type: String, unique: true, sparse: true },
  paid_at: { type: Date },
  notes: { type: String },
  created_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Payment", paymentSchema);