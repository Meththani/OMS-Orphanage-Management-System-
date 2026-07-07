require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const authRoutes = require('./routes/authRoutes');
const staffRoutes = require('./routes/staffRoutes');
const childRoutes = require('./routes/childRoutes');
const donationRoutes = require('./routes/donationRoutes');
const publicRoutes = require('./routes/publicRoutes');
const financialRoutes = require('./routes/financialRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');
const messageRoutes = require('./routes/messageRoutes');

const app = express();
app.use(cors());
app.use(express.json());

connectDB();

app.use('/api/auth', authRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/children', childRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/finances', financialRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/messages', messageRoutes);


// Centralized error handler — catches anything thrown that wasn't already
// caught and turned into a res.status().json() inside a controller.
app.use((err, req, res, next) => {
  res.status(err.statusCode || 500).json({ status: 'error', message: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`OMS server running on port ${PORT}`));
