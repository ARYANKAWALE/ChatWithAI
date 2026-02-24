import  express from "express"
import { getUser, loginUser, registerUser } from "../Controllers/userController.js"
import { protect } from "../Middlewares/auth.js";

const userRouter = express.Router()

userRouter.post('/register',registerUser)
userRouter.post('/login', loginUser)
userRouter.get('/data',protect, getUser)


export default userRouter