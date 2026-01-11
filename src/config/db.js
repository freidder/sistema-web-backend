const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error('MONGO_URI not set in environment. Please add it to your .env (see .env.example)');
    process.exit(1);
  }

  try {
    await mongoose.connect(uri, {
      // Mongoose 7+ ignores these but they are harmless for compatibility
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    // mongoose.connection.name will contain the database name (e.g., santanderDB) when connected
    const dbName = mongoose.connection.name || 'unknown';
    console.log(`MongoDB connected (db: ${dbName})`);
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    console.error('Check that your MONGO_URI is correct and that your IP is allowed in MongoDB Atlas Network Access.');
    process.exit(1);
  }
};

module.exports = connectDB;
