const express = require('express');
const router = express.Router();

const {createProduct,fetchAllProducts,updateProduct,deleteProduct,fetchSingleProduct,postProductReview,deleteReview,fetchAIFilteredProducts} = require('../controllers/productController.js');
const {isAuthenticated, authorizedRoles} = require('../middlewares/authMiddleware');

router.post("/admin/create",isAuthenticated,authorizedRoles("admin"),createProduct);
router.get("/",fetchAllProducts);
router.put('/admin/update/:productID',isAuthenticated,authorizedRoles("admin"),updateProduct);
router.delete('/admin/delete/:productID',isAuthenticated,authorizedRoles("admin"),deleteProduct);
router.get('/singleProduct/:productID',fetchSingleProduct);
router.put('/post-new/review/:productID',isAuthenticated,postProductReview);
router.delete('/delete/review/:productID',isAuthenticated,deleteReview);
router.post('/ai-search',isAuthenticated,fetchAIFilteredProducts);
module.exports = router;