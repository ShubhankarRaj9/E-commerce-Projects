const express = require('express');
const  {fetchSingleOrder,placeNewOrder,fetchMyOrders,fetchAllOrders,updateOrderStatus,deleteOrder,
} = require("../controllers/orderController.js");
const {isAuthenticated,authorizedRoles} = require("../middlewares/authMiddleware.js");
const router = express.Router();

router.post("/new",isAuthenticated,placeNewOrder);
router.get("/:orderId", isAuthenticated, fetchSingleOrder);
router.get("/orders/me", isAuthenticated, fetchMyOrders);
router.get("/admin/getall",isAuthenticated,authorizedRoles("admin"),fetchAllOrders);
router.put("/admin/update/:orderId",isAuthenticated,authorizedRoles("admin"),updateOrderStatus);
router.delete("/admin/delete/:orderId",isAuthenticated,authorizedRoles("admin"),deleteOrder);

module.exports = router;
