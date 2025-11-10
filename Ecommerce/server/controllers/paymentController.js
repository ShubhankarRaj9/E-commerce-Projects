const {ErrorHandler} = require('../middlewares/errorMiddleware');
const catchAsyncError = require('../middlewares/catchAsyncError');
const crypto = require("crypto")
const Order=require('../models/order');
const Payment = require('../models/payment');
const Product = require('../models/product');
const ShippingInfo = require('../models/shippingInfo');

const dotenv = require('dotenv');
dotenv.config({ path: 'config/config.env' }); 
const Razorpay = require('razorpay');
const razorPay = new Razorpay({
    key_id:process.env.RAZOR_API_KEY,
    key_secret:process.env.RAZOR_SECRET_KEY,
});


const createRazorpayOrder = async ({ amount, comment, userId }) => {
    if (!razorPay) {
        throw new Error("Razorpay instance is not initialized");
    }
    const options = {
        amount: Math.round(amount * 100),
        currency: "INR",
        receipt: `receipt_${Date.now()}`,
        notes: { userId, comment: comment || "Order Payment" },
    };

    const order = await new Promise((resolve, reject) => {
        razorPay.orders.create(options, (err, order) => {
            if (err) return reject(err);
            resolve(order);
        });
    });

    if (!order || !order.id) {
        throw new Error("Razorpay order creation failed");
    }

    console.log("Razorpay order created:", order);
    return order;
};




const processPayment = catchAsyncError(async({ amount, comment, userId })=>{
     return await createRazorpayOrder(data);
});
const sendAPIKey = catchAsyncError(async(req,res,next)=>{
        res.status(200).json({
        key:process.env.RAZOR_API_KEY
    })
});


const verifyPayment = catchAsyncError(async (req, res, next) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
         return next(new ErrorHandler("Missing one or more required verification fields.", 400));
    }
    const generated_signature = crypto
        .createHmac('sha256', process.env.RAZOR_SECRET_KEY)
        .update(razorpay_order_id + "|" + razorpay_payment_id)
        .digest('hex');

    if (generated_signature !== razorpay_signature) {
        return next(new ErrorHandler('Payment verification failed', 400));
    }

    // Update Payment and Order status in DB
    const payment = await Payment.findOneAndUpdate(
        { payment_intent_id: razorpay_order_id },
        { payment_status: "Paid", razorpay_payment_id }
    );
    if(!payment) return next(new ErrorHandler("Payment record not found",404));

   const order =  await Order.findOneAndUpdate(
        { orderId: razorpay_order_id },
        { order_status: "Paid", paid_at: Date.now() }
    );
    if (!order) return next(new ErrorHandler("Order record not found", 404));

     if (order.products?.length > 0) {
        const bulkOps = order.products.map(item => ({
            updateOne: { filter: { _id: item.product_id }, update: { $inc: { stock: -item.quantity } } }
        }));
        await Product.bulkWrite(bulkOps);
    }
    await ShippingInfo.updateOne(
        { order_id: order._id },
        { status: "Paid", paid_at: Date.now() }
    );

    res.status(200).json({ success: true, message: "Payment verified successfully", orderId: order.orderId, total_price: order.total_price, products: order.products });
});








module.exports = {processPayment,sendAPIKey,verifyPayment,createRazorpayOrder};
