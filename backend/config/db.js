const mongoose = require('mongoose');
const seedDatabase = require('./seeder');

const connectWithMemoryServer = async () => {
  console.log('-----------------------------------------------------------');
  console.log('🔄 Spinning up in-memory MongoDB server as fallback...');
  const { MongoMemoryServer } = require('mongodb-memory-server');
  const mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  console.log(`✅ In-memory MongoDB running at: ${uri}`);
  await mongoose.connect(uri);
  console.log('MongoDB connected (In-Memory).');
  await seedDatabase();
  console.log('-----------------------------------------------------------\n');
};

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    console.log('No MONGO_URI specified in env. Using MongoDB Memory Server...');
    await connectWithMemoryServer();
    return;
  }

  try {
    // Attempt connection with 5-second timeout so it doesn't hang indefinitely if Atlas is blocked
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log('MongoDB connected (Atlas / Remote).');
    await seedDatabase();
  } catch (err) {
    console.error('\n⚠️  MongoDB Atlas connection failed:', err.message);
    console.error('👉 TIP: To connect to MongoDB Atlas directly:');
    console.error('   1. Log into https://cloud.mongodb.com/');
    console.error('   2. Go to "Network Access" under Security in the left sidebar');
    console.error('   3. Click "Add IP Address" -> Select "Allow Access From Anywhere" (0.0.0.0/0) or "Add Current IP Address"');
    console.error('   4. Click Confirm\n');

    try {
      console.log('Falling back to local in-memory database so the server remains functional...');
      await connectWithMemoryServer();
    } catch (memErr) {
      console.error('Failed to start in-memory database fallback:', memErr.message);
      process.exit(1);
    }
  }
};

module.exports = connectDB;

