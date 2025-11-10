const {ErrorHandler} = require('../middlewares/errorMiddleware');
const catchAsyncError = require('../middlewares/catchAsyncError');
const User = require('../models/user.js');
const Product = require('../models/product.js');
const Order = require('../models/order.js');
const cloudinary = require("cloudinary").v2;

const getAllUsers = catchAsyncError(async (req,res,next) => {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page-1)*limit;
    const totalUsers = await User.countDocuments({role:"user"});
    const users = await User.find({role:"user"}).sort({createdAt:-1}).limit(limit).skip(skip);
    res.status(200).json({
        success:true,
        users,
        totalUsers,
        totalPages: Math.ceil(totalUsers/limit),
        currentPage: page,
    });
});

const deleteUser = catchAsyncError(async (req,res,next) => {
    const {id} = req.params;
    const deletingUser = await User.findById(id);
    if(!deletingUser){
        return next(new ErrorHandler("User not found",404));
    }
    const avatar = deletingUser.avatar;
    if(avatar && avatar.public_id){
        await cloudinary.uploader.destroy(avatar.public_id)
    }
    await deletingUser.deleteOne({_id:id});
    res.status(200).json({
        success:true,
        message:"User deleted successfully"
    });
});

const dashboardStats = catchAsyncError(async (req,res,next) => {

    const today = new Date();
    const todayDate = today.toISOString().slice('T')[0];

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate()-1);
    const yesterdayDate = yesterday.toISOString().slice('T')[0];

    const currentMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const previousMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const previousMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);

    const totalRevenueAllTime = await Order.aggregate([  {$group: { _id: null,totalRevenue: { $sum: "$total_price" }} }]);
    const totalRevenue = totalRevenueAllTime[0]?.totalRevenue || 0;

    const totalUsersCount = await User.countDocuments({role:"user"});

    // order status count
    const orderStatusAgg = await Order.aggregate([{
    $group: { _id: "$order_status", count: { $sum: 1 }}
    }]);

    const orderStatus = {Processing: 0,Shipped: 0,Delivered: 0,Cancelled: 0};
    orderStatusAgg.forEach(status => {
      orderStatus[status._id] = status.count;
    });

    const todayRevenueAgg = await Order.aggregate([
        {
            $match: {
                created_at: {
                    $gte: new Date(`${todayDate}T00:00:00Z`),
                    $lte: new Date(`${todayDate}T23:59:59Z`),
                }
            }
        },  
        { $group: { _id: null, todayRevenue: { $sum: "$total_price" } } }
    ]);
    const todayRevenue = todayRevenueAgg[0]?.todayRevenue || 0;

    const yesterdayRevenueAgg = await Order.aggregate([
        {
            $match: {
                created_at: {
                    $gte: new Date(`${yesterdayDate}T00:00:00Z`),
                    $lte: new Date(`${yesterdayDate}T23:59:59Z`),
                }
            }
        },  
        { $group: { _id: null, yesterdayRevenue: { $sum: "$total_price" } } }
    ]);
    const yesterdayRevenue = yesterdayRevenueAgg[0]?.yesterdayRevenue || 0;

    const currentMonthRevenueAgg = await Order.aggregate([
        {
            $match: {
                created_at: {
                    $gte: currentMonthStart,
                    $lte: today
                }
            }
        },
        { $group: { _id: null, currentMonthRevenue: { $sum: "$total_price" } } }
    ]);
    const currentMonthRevenue = currentMonthRevenueAgg[0]?.currentMonthRevenue || 0;

    const previousMonthRevenueAgg = await Order.aggregate([
        {
            $match: {
                created_at: {
                    $gte: previousMonthStart,
                    $lte: previousMonthEnd
                }
            }
        },
        { $group: { _id: null, previousMonthRevenue: { $sum: "$total_price" } } }
    ]);
    const previousMonthRevenue = previousMonthRevenueAgg[0]?.previousMonthRevenue || 0;
    const monthlySalesRevenueAgg = await Order.aggregate([
        {
            $group: {
                _id: { $dateToString: { format: "%Y-%m", date: "$created_at" } },
                totalRevenue: { $sum: "$total_price" }
            }
        },
        { $sort: { _id: 1 } }
    ]);
    const monthlySalesRevenue = monthlySalesRevenueAgg.map(item => ({
        month: item._id,
        totalRevenue: parseFloat(item.totalRevenue) || 0,
    }));

    // top 5 Most selling products
    const topSellingProductsAgg = await Order.aggregate([
        { $unwind: "$products" },
        { $group: { _id: "$products.product_id", totalSold: { $sum: "$products.quantity" } } },
        { $sort: { totalSold: -1 } },
        { $limit: 5 }
    ]);
    const topProducts = topSellingProductsAgg.map(item => ({
        productId: item._id,
        totalSold: item.totalSold
    }));
    // Products with stock less than or equal to 10.
    const lowStockProducts = await Product.find({ stock: { $lte: 10 } }).select('name stock');

    const lowStock = lowStockProducts.map(product => ({
        name: product.name,
        stock: product.stock
    }));

    // Revenue growth rate

    let revenueGrowth = 0;
    if(previousMonthRevenue > 0){
        const growthRate = ((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue) * 100;
        revenueGrowth = `${growthRate>=0 ? "+" : ""}${growthRate.toFixed(2)}%`;
    }
    const newUserThisMonth = await User.countDocuments({
        role: "user",
        createdAt: { $gte: currentMonthStart, $lte: today }
    });


    res.status(200).json({
        success:true,
        message:"Dashboard stats fetched successfully",
        totalRevenueAllTime,
        totalRevenue,
        totalUsersCount,
        orderStatus,
        todayRevenue,
        yesterdayRevenue,
        currentMonthRevenue,
        previousMonthRevenue,
        topProducts,
        lowStock,
        revenueGrowth,
        newUserThisMonth,
        monthlySalesRevenue,
    });
});

module.exports = { getAllUsers,deleteUser,dashboardStats};