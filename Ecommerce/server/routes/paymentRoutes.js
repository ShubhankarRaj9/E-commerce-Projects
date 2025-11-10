const express = require('express');
const {processPayment,sendAPIKey,verifyPayment}  = require('../controllers/paymentController');
const {isAuthenticated} = require('../middlewares/authMiddleware');

const router = express.Router();


router.route('/order').post(isAuthenticated,processPayment);
router.route('/getKey').get(isAuthenticated,sendAPIKey);
router.post('/verify', isAuthenticated, verifyPayment);
module.exports = router;