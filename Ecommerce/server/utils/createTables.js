const User = require('../models/user');
const Order = require('../models/order');
const Product = require('../models/product');
const ProductReview = require('../models/productReview');
const ShippingInfo = require('../models/shippingInfo');
const OrderItem = require('../models/orderItem');
const PaymentInfo = require('../models/payment');

exports.createTables = async () => {
    try {
        await User.init();
        await Product.init();
        await ProductReview.init();
        await Order.init();
        await OrderItem.init();
        await ShippingInfo.init();
        await PaymentInfo.init();
        console.log("All collections are created and initialized.");
    } catch (error) {
        console.error("Error creating collections:", error);
    }
};