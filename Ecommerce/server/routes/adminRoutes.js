const express = require('express');
const router= express.Router();

const { getAllUsers,deleteUser,dashboardStats} = require('../controllers/adminController');
const { isAuthenticated, authorizedRoles } = require('../middlewares/authMiddleware');

router.get('/getallusers', isAuthenticated, authorizedRoles("admin"), getAllUsers); // dashboard only
router.delete('/delete/:id', isAuthenticated, authorizedRoles("admin"),deleteUser);
router.get('/fetch/dashboard', isAuthenticated, authorizedRoles("admin"), dashboardStats);
module.exports = router;


