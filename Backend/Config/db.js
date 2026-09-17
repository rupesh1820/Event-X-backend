import mongoose from 'mongoose';

export const connectDB = async () => {
    const mongoUri = process.env.MONGO_DB;

    if (!mongoUri) {
        throw new Error('MONGO_DB is missing. Add your MongoDB connection string to Backend/.env');
    }

    await mongoose.connect(mongoUri);
    console.log('MongoDB connected');
};