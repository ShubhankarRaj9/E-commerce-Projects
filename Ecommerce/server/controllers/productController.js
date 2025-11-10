const catchAsyncErrors = require("../middlewares/catchAsyncError.js");
const {ErrorHandler} = require("../middlewares/errorMiddleware.js");
const cloudinary = require("cloudinary").v2;
const Product= require("../models/product.js");
const Order = require("../models/order.js");
const  getAIRecommendations  = require("../utils/getAIRecommendation.js");



const createProduct = catchAsyncErrors(async(req,res,next) => {
    const {name,description,price,category,stock} = req.body;
    const created_by = req.user.id;
    if(!name ||!description || !price || !category || !stock){
        return next(
            new ErrorHandler("Please provide complete product details.", 400)
        );
    }
    let uploadedImages = [];
    if(req.files && req.files.images){
        const images = Array.isArray(req.files.images) ? req.files.images : [req.files.images];

        for(const image of images){
            const result = await cloudinary.uploader.upload(image.tempFilePath,{
                folder:"Ecommerce_Product_Images",
                width:1000,
                crop:"scale",
            });
            uploadedImages.push({
                url:result.secure_url,
                public_id:result.public_id,
            });
        }
    }
    const product = await Product.create({
        name,description,
        price
        ,category,stock,
        images: uploadedImages,created_by
    });
    res.status(201).json({
        success:true,
        message:"Product created successfully!",
        product
    })
});


const fetchAllProducts = catchAsyncErrors(async(req,res,next) => {
    const {availability, price, category, ratings, search} = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit; 
    const query = {};
    if(availability === 'in-stock')
    {
        query.stock= { $gt: 5 };
    }else if(availability === 'limited')
    {
        query.stock = { $gt: 0, $lte: 5 };
    }else if(availability === 'out-of-stock')
    {
        query.stock = 0;
    }

    if(price){
        const [minPrice, maxPrice] = price.split("-");
        if(minPrice && maxPrice) {
            query.price = {$gte:Number(minPrice), $lte:Number(maxPrice)};
        }
    }

    if(category){
        query.category = {$regex:category, $options:"i"};
    }

    if(ratings){
        query.ratings = {$gte:Number(ratings)};
    }

    if(search){
        query.$or = [
            {name:{$regex:search,$options:"i"}},
            {description:{$regex:search,$options:"i"}}
        ];
    }
    
    const totalProducts = await Product.countDocuments(query);
    const totalPages = Math.ceil(totalProducts / limit);

    const products = await Product.find(query).skip(skip).limit(limit).sort({created_at : -1});

    const dateThreshold= new Date();
    dateThreshold.setDate(dateThreshold.getDate()-30);

    const newProducts = await Product.find({created_at:{$gte:dateThreshold}}).sort({created_at:-1}).limit(8);


    const topRatedProducts = await Product.find({ratings:{$gte:4}}).sort({created_at:-1}).limit(8);

    res.status(200).json({
        success:true,
        totalProducts,
        totalPages,
        currentPage: page,
        products,
        newProducts,
        topRatedProducts,
    })
});

const updateProduct = catchAsyncErrors(async(req,res,next) => {
    const {productID}  = req.params;
    const {name,description,price,category,stock} = req.body;
    if(!name ||!description || !price || !category || !stock){
        return next(
            new ErrorHandler("Please provide complete product details.", 400)
        );
    }
    const product = await Product.findById(productID);
    if(!product){
        return next(new ErrorHandler("Product not found",404));
    }
    product.name = name;
    product.description = description;
    product.price = price;
    product.category = category;
    product.stock = stock;
    await product.save();
    res.status(200).json({
        success:true,
        message:"Product updated successfully!",
        product
    })
});
const deleteProduct = catchAsyncErrors(async(req,res,next) => {
    const {productID}  = req.params;
    const product = await Product.findById(productID);
    if(!product){
        return next(new ErrorHandler("Product not found",404));
    }
    const images = product.images;
     if (Array.isArray(images) && images.length > 0) {
        for (const image of images) {
            try {
                await cloudinary.uploader.destroy(image.public_id);
            } catch (err) {
                console.log("Cloudinary image deletion failed:", err.message);
            }
        }
    }
    await Product.findByIdAndDelete(productID);
    res.status(200).json({
        success:true,
        message:"Product deleted successfully!",
        deletedProductID: productID
    })
});
const fetchSingleProduct = catchAsyncErrors(async(req,res,next) => {
    const {productID}  = req.params;
    const product = await Product.findById(productID);
    if(!product){
        return next(new ErrorHandler("Product not found",404));
    }   
    res.status(200).json({
        success:true,
        product
    })
});

const postProductReview = catchAsyncErrors(async(req,res,next) => {
    const {productID} = req.params;
    const {rating, comment} = req.body;
    const userID = req.user.id;
    if(!rating || !comment){
        return next(new ErrorHandler("Please provide rating and comment",400));
    }
    const product = await Product.findById(productID);
    if(!product){
        return next(new ErrorHandler("Product not found",404));
    }
    const purchasedCheck = await Order.findOne({
        user: userID,
        "orderItems.product": productID,
        status: "delivered"
    });
    console.log(await Order.find({ user: userID }));
    if(!purchasedCheck){
        return next(new ErrorHandler("You can only review products you have purchased and received.",403));
    }
    const existingReview = product.reviews.find(
        (rev) => rev.user.toString() === userID.toString()
    );
    if(existingReview){
        existingReview.rating = rating;
        existingReview.comment = comment;
    }
    else{
        product.reviews.push({
            user: userID,
            rating,
            comment
        });
    }
    product.numOfReviews = product.reviews.length;

    product.ratings = product.reviews.reduce((sum,rev) => rev.rating + sum,0) / product.numofReviews;
    await product.save();
    res.status(200).json({
        success:true,
        message:"Review submitted successfully!",
        product,
        comment: comment,
        rating: rating,
        reviews: product.reviews,
    });
});

const  deleteReview = catchAsyncErrors(async(req,res,next) => {
    const {productID} = req.params;
    const {reviewID} = req.body;
    const product = await Product.findById(productID);
    if(!product){
        return next(new ErrorHandler("Product not found",404));
    }
    const reviews = product.reviews.filter(
        (rev) => rev._id.toString() !== reviewID.toString()
    );
    product.reviews = reviews;
    product.numOfReviews = reviews.length;
    product.ratings =product.numOfReviews>0 ? reviews.reduce((sum,rev) => rev.rating + sum,0) / product.numOfReviews : 0;
    await product.save();
    res.status(200).json({
        success:true,
        message:"Review deleted successfully!",
        product,
        reviews: product.reviews,
    });
});

const fetchAIFilteredProducts = catchAsyncErrors(async(req,res,next) => {
    const {userPrompt} = req.body;
    if(!userPrompt){
        return next(new ErrorHandler("Please provide a valid prompt",400));
    }
    // AI filtering logic to be implemented
    const filterKeywords = (query) => {
        const stopWords = new Set([ "the","they","them","then","I","we","you","he","she","it","is","a","an","of","and","or","to","for","from","on","who","whom","why","when","which","with","this","that","in","at","by","be","not","was","were","has","have","had","do","does","did","so","some","any","how","can","could","should","would","there","here","just","than","because","but","its","it's","if",".",",","!","?",">","<",";","`","1","2","3","4","5","6","7","8","9","10",]);
    return query.toLowerCase().replace(/[^\w\s]/g,"").split(/\s+/).filter(word => !stopWords.has(word)).map((word) => new RegExp(word,"i"));
    };
    const keywords = filterKeywords(userPrompt);
    const result = await Product.find({
        $or:[
            { name:{$in:keywords} },
            { description:{$in:keywords}},
            { category:{$in:keywords}},
        ]
    }).limit(200); 
    const filteredProducts = result;
    if(filteredProducts.length === 0){
        return res.status(200).json({
            success:true,
            message:"No products found matching the given prompt.",
            filteredProducts: [],
        });
    }
   const {success,products} = await getAIRecommendations(req, res, userPrompt, filteredProducts);   
    res.status(200).json({
        success:success,
        message:"AI filtered products fetched successfully!",
        filteredProducts: products,
    });

});


module.exports = {createProduct,fetchAllProducts,updateProduct,deleteProduct,fetchSingleProduct,postProductReview,deleteReview,fetchAIFilteredProducts};