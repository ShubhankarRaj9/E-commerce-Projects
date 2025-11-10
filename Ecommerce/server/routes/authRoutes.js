const express = require('express');
const router = express.Router();
const {register,login,getUser,logout, forgotPassword,resetPassword,updatePassword,updateProfile} = require('../controllers/authController');
const {isAuthenticated} = require('../middlewares/authMiddleware');
router.post('/register',register);
router.post('/login',login);
router.get('/me',isAuthenticated, getUser);
router.get('/logout',isAuthenticated, logout);
router.post('/password/forgot', forgotPassword);
router.put('/password/reset/:token', resetPassword);
router.put('/password/update',isAuthenticated, updatePassword);
router.put("/profile/update",isAuthenticated,updateProfile)
module.exports = router;