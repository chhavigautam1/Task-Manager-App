import express from "express";
import cors from "cors"
import dotenv, { configDotenv } from "dotenv";
import { connectDb } from "./config/db.js";
import userRouter from './routes/userRoutes.js'
import taskRouter from "./routes/taskRoutes.js";

dotenv.config()
connectDb()


const app=express()
const PORT=process.env.PORT || 4000

app.use(express.json())
const allowedOrigins = ['https://task-manager-app-1-fqwu.onrender.com'];

app.use(cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      return callback(new Error('CORS policy does not allow this origin.'), false);
    }
    return callback(null, true);
  },
  credentials: true,
}));
app.use(express.urlencoded({extended:true}))


//routes
app.use('/api/v1/user',userRouter)
app.use('/api/v1/tasks',taskRouter)

app.get("/",(req,res)=>{
    res.send("apiworking")
})

app.listen(PORT,()=>{
    console.log(`server started on port ${PORT}`)
})
