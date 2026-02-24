import express from "express"
import 'dotenv/config'
import cors from "cors"
import connectDB from "./Configs/db.js"
import userRouter from './routes/userRoutes.js'
import chatRouter from './routes/chatRoutes.js'

const app = express()
const PORT = process.env.PORT || 3000

// Middlewares
app.use(cors())
app.use(express.json())

// Routes
app.get('/', (req, res) => res.send("Server is running!"))
app.use('/api/user', userRouter)
app.use('/api/chat',chatRouter)

// Database Connection then Server Start
const startServer = async () => {
    try {
        await connectDB(); // Ensure your connectDB function returns a promise (uses async/await)
        console.log("Database connected successfully");
        
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error("Database connection failed:", error.message);
        process.exit(1); // Server start hi nahi hoga agar DB fail hua
    }
};

startServer();