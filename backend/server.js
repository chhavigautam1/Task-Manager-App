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
app.use(cors())
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
