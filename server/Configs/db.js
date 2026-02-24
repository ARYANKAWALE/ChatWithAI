import mongoose from 'mongoose'

const connectDB = async () => {
    try {
        await mongoose.connect(`${process.env.MONGO_URI}/quickgpt`, {
            serverSelectionTimeoutMS: 5000 
        })
        console.log('Database connected successfully')
    } catch (error) {
        console.error('Database connection error:', error.message)
        process.exit(1)
    }
}

export default connectDB
