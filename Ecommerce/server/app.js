const express = require('express');
const app = express();

const authRoutes = require('./routes/authRoutes.js');
const productRoutes = require('./routes/productRoutes.js');
const adminRoutes = require('./routes/adminRoutes.js');
const orderRoutes = require('./routes/orderRoutes.js')
const paymentRoutes = require('./routes/paymentRoutes.js')
const dotenv = require('dotenv');
dotenv.config({path: 'config/config.env'});

const { createTables } = require('./utils/createTables.js');
const connectDatabase = require('./database/database.js');

const { errorMiddleware } = require('./middlewares/errorMiddleware.js');
connectDatabase();

const cors = require('cors');
app.use(cors({
    origin: [process.env.FRONTEND_URL,process.env.DASHBOARD_URL],
    methods: ['GET','POST','PUT','DELETE'],
    credentials: true
}));
// other middleware
const cookieParser = require('cookie-parser');
app.use(cookieParser());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const fileUpload = require('express-fileupload');
app.use(fileUpload({
    tempFileDir:'./uploads',
    useTempFiles:true,
}));


app.use('/api/v1/auth',authRoutes);
app.use('/api/v1/product',productRoutes);
app.use('/api/v1/admin',adminRoutes);
app.use('/api/v1/order',orderRoutes);
app.use('/api/v1/payment',paymentRoutes);
createTables();
app.use(errorMiddleware);
module.exports = app;

