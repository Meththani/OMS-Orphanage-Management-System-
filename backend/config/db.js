const mongoose = require('mongoose');
const seedDatabase = require('./seeder');

const connectDB = async () => {
  try {
    let mongoUri = process.env.MONGO_URI;
    
    if (!mongoUri) {
      console.log('No MONGO_URI specified in env. Spinning up MongoDB Memory Server...');
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongoServer = await MongoMemoryServer.create();
      mongoUri = mongoServer.getUri();
      console.log(`MongoDB Memory Server started at: ${mongoUri}`);
    }

    await mongoose.connect(mongoUri);
    console.log('MongoDB connected.');
    
    // Seed default users and records
    await seedDatabase();
  } catch (err) {
    console.error('MongoDB connection failed:', err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
