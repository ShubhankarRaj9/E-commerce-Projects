const {ErrorHandler} = require('../middlewares/errorMiddleware');
const catchAsyncError = require('../middlewares/catchAsyncError');
const ShippingInfo = require('../models/shippingInfo.js')
const Order = require('../models/order.js')
const Product = require('../models/product.js');
const OrderItem = require('../models/orderItem.js');
const mongoose = require('mongoose');
const {processPayment, createRazorpayOrder} = require("./paymentController.js");
const Payment = require("../models/payment.js");




const placeNewOrder = catchAsyncError(async(req,res,next)=>{

    const {full_name,state,city,country,address,zipcode,phone,orderedItems} = req.body;
    if( !full_name|| !state || !city || !country || !address ||!zipcode || !phone){return next (new ErrorHandler("Provide All Shipping  Details. ",404));}

    const items = Array.isArray(orderedItems) ? orderedItems: JSON.parse(orderedItems||"[]");
    if(!items || items.length === 0){
        return next(new ErrorHandler("No items in cart. ", 400));
    }

    const productIds = items.map((item)=>item.product_id||item.product._id);

    const dbProducts = await Product.find({ _id: { $in: productIds } });
    if (dbProducts.length !== productIds.length) {return next(new ErrorHandler("One or more products were not found.", 404)); }

    let subTotal = 0;
    const orderProducts  =[];
    const taxRate = 0.008;
    const shippingFee= 2;

    for(const item of items){
        const product = dbProducts.find(p => p._id.toString() === item.product_id);
        if(!product){
            return next(new ErrorHandler(`Product not found for id:${item.product_id||item.product._id}`,404));
        }
        if(item.quantity > product.stock){
            return next(new ErrorHandler(`Only ${product.stock} unit available for ${product.name}`,404));
        }

        const itemTotal = product.price * item.quantity;
        subTotal += itemTotal;

        orderProducts.push({
            product_id: product._id,
            quantity: item.quantity,
            price: product.price,
            image: product.images ? product.images?.[0]?.url : "", 
            title: product.name
        });
    }
    const final_tax_price = subTotal*taxRate;
    const final_shipping_price = shippingFee;
    const final_total_price = Math.round(subTotal+final_tax_price+final_shipping_price);

    const orderResult = await Order.create({
        orderId: `ORD-${Date.now()}`,
        buyer_id:req.user._id,
        total_price:final_total_price,
        tax_price:final_tax_price,
        shipping_price:final_shipping_price,
        order_status:"Processing",
    });
    const orderId = orderResult._id;
    await ShippingInfo.create({order_id:orderId,
        full_name,state,city,country,address,zipcode,phone,user_id:req.user._id,
    })

    const orderItemPromises = orderProducts.map((itemData) => OrderItem.create({ order_id:orderId,...itemData}));
    await Promise.all(orderItemPromises);
   
    let razorpayOrder;
try {
    razorpayOrder = await createRazorpayOrder({
        amount: final_total_price*100,
        comment: "Order Payment",
        userId: req.user._id
    });
    console.log("razorpayOrder.id:", razorpayOrder.id);
} catch (error) {
  //  console.log("razorpayOrder.id:", razorpayOrder._id);
    return next(new ErrorHandler("Payment initialization failed.", 500));
}
     await Payment.create({
        order_id:orderId,
        payment_status: "Pending",
        payment_type: "Online",
        payment_intent_id:razorpayOrder.id,
    });

    res.status(200).json({
        success:true,
        message:"Order place successfully.Proceed to payment.",
        orderId,
        total_price:final_total_price,
        razorpay_order_id: razorpayOrder.id,
        orderData: {
            order_id: razorpayOrder.id,
            amount: razorpayOrder.amount/100,
            currency: razorpayOrder.currency,
            key: process.env.RAZOR_API_KEY,
        }
        })
});
const fetchSingleOrder = catchAsyncError(async (req,res,next) => {
    const {orderId} = req.params;
    const orderDetails = await Order.aggregate([
    { $match: { _id: new mongoose.Types.ObjectId(orderId) } },
    { $lookup: {
      from: "orderitems",
      localField: "_id",
      foreignField: "order_id",
      as: "order_items"
    }},
    { $lookup: {
      from: "shippinginfos",
      localField: "_id",
      foreignField: "order_id",
      as: "shipping_info"
    }},
    { $unwind: {
      path: "$shipping_info",
      preserveNullAndEmptyArrays: true
    }},
    { $project: {
      orderId: 1,
      paymentId: 1,
      buyer_id: 1,
      total_price: 1,
      tax_price: 1,
      shipping_price: 1,
      order_status: 1,
      created_at: 1,
      paid_at: 1,
      order_items: {
        $map: {
          input: "$order_items",
          as: "item",
          in: {
            order_item_id: "$$item._id",
            order_id: "$$item.order_id",
            product_id: "$$item.product_id",
            quantity: "$$item.quantity",
            price: "$$item.price"
          }
        }
      },
      shipping_info: {
        full_name: "$shipping_info.full_name",
        state: "$shipping_info.state",
        city: "$shipping_info.city",
        country: "$shipping_info.country",
        address: "$shipping_info.address",
        zipcode: "$shipping_info.zipcode",
        phone: "$shipping_info.phone"
      },},}
]);
    res.status(201).json({
        success:true,
        message:'Orders fetch',
        orderDetails,
    })
});
const fetchMyOrders = catchAsyncError(async (req,res,next) => {
    const buyerId = req.user._id;

  const myOrders = await Order.aggregate([
    {
      $match: {
        buyer_id: new mongoose.Types.ObjectId(buyerId),
      },
    },
    {
      $lookup: {
        from: "orderitems",
        localField: "_id",
        foreignField: "order_id",
        as: "order_items",
      },
    },
    {
      $lookup: {
        from: "shippinginfos",
        localField: "_id",
        foreignField: "order_id",
        as: "shipping_info",
      },
    },
    {
      $unwind: {
        path: "$shipping_info",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $project: {
        _id: 1,
        orderId: 1,
        buyer_id: 1,
        total_price: 1,
        tax_price: 1,
        shipping_price: 1,
        order_status: 1,
        created_at: 1,
        paid_at: 1,
        order_items: {
          $map: {
            input: "$order_items",
            as: "item",
            in: {
              order_item_id: "$$item._id",
              order_id: "$$item.order_id",
              product_id: "$$item.product_id",
              quantity: "$$item.quantity",
              price: "$$item.price",
              image: "$$item.image",
              title: "$$item.title",
            },
          },
        },
        shipping_info: {
          full_name: "$shipping_info.full_name",
          state: "$shipping_info.state",
          city: "$shipping_info.city",
          country: "$shipping_info.country",
          address: "$shipping_info.address",
          zipcode: "$shipping_info.zipcode",
          phone: "$shipping_info.phone",
        },
      },
    },
  ]);

  res.status(200).json({
    success: true,
    message: "All My Orders fetched successfully.",
    myOrders,
  });
});
const fetchAllOrders = catchAsyncError(async (req,res,next) => {
    const totalOrder = await Order.aggregate([
  {
    $lookup: {
      from: "orderitems",
      localField: "_id",
      foreignField: "order_id",
      as: "order_items",
    },
  },
  {
    $lookup: {
      from: "shippinginfos",
      localField: "_id",
      foreignField: "order_id",
      as: "shipping_info",
    },
  },
  {
    $unwind: {
      path: "$shipping_info",
      preserveNullAndEmptyArrays: true,
    },
  },
  {
    $project: {
      _id: 1,
      orderId: 1,
      buyer_id: 1,
      total_price: 1,
      tax_price: 1,
      shipping_price: 1,
      order_status: 1,
      paid_at: 1,
      created_at: 1,
      order_items: {
        $map: {
          input: "$order_items",
          as: "item",
          in: {
            order_item_id: "$$item._id",
            order_id: "$$item.order_id",
            product_id: "$$item.product_id",
            quantity: "$$item.quantity",
            price: "$$item.price",
            image: "$$item.image",
            title: "$$item.title",
          },
        },
      },
      shipping_info: {
        full_name: "$shipping_info.full_name",
        state: "$shipping_info.state",
        city: "$shipping_info.city",
        country: "$shipping_info.country",
        address: "$shipping_info.address",
        zipcode: "$shipping_info.zipcode",
        phone: "$shipping_info.phone",
      },
    },
  },
]);
    res.status(200).json({
        success:true,
        message:"All order fetched successfully",
        totalOrder,
    })
});
const updateOrderStatus = catchAsyncError(async (req,res,next) => {
    const { status } = req.body;
    const { orderId } = req.params;
    if(!status){
        return next(new ErrorHandler("Provide a valid status.", 400));
    }
     const order = await Order.findOne({orderId});
  if (!order) {
    return next(new ErrorHandler("Invalid order ID.", 404));
  }
  order.order_status = status;
  const updatedOrder = await order.save();

  res.status(200).json({
    success: true,
    message: "Order status updated successfully.",
    updatedOrder,
  });
});     
const deleteOrder = catchAsyncError(async (req,res,next) => {
    const {orderId} = req.params;
    const deleteItem = await Order.findOneAndDelete({ orderId });

  if (!deleteItem) {
    return next(new ErrorHandler("Invalid order ID.", 404));
  }

  res.status(200).json({
    success: true,
    message: "Order deleted successfully.",
  });
});
module.exports ={fetchSingleOrder,placeNewOrder,fetchMyOrders,fetchAllOrders,updateOrderStatus,deleteOrder,
};