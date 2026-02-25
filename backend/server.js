const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();
const sequelize = require('./db/db-connection');
const { Order } = require('./model/Order');
const { User } = require('./model/User');
const productRoutes = require('./route/route');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:5173'],
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve Uploads Folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api', productRoutes);

const startServer = async () => {
    try {
        await sequelize.authenticate();
        // Use { alter: true } to update table schema without losing data
        await Order.sync({ alter: true });
        await User.sync();
        console.log('✅ Database connected');
        app.listen(PORT, () => console.log(`🚀 Server on port ${PORT}`));
    } catch (error) {
        console.error('❌ Startup failed:', error);
    }
};

startServer();
