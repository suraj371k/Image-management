import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser'
import connectDB from './config/db.js'

//import routes
import userRoutes from './routes/user.routes.js'
import folderRoutes from './routes/folder.routes.js'
import imageRoutes from './routes/image.routes.js'

dotenv.config()
const app = express()

//middleware
app.use(
    cors({
      origin: ["http://localhost:5173" , "https://image-management-ten.vercel.app"], 
      credentials: true,             
    })
  );app.use(express.json())
app.use(cookieParser())

app.get('/' , (req , res) => {
    res.send('server is running successfully')
})



//routes
app.use('/api/user' , userRoutes)
app.use('/api/folder' , folderRoutes)
app.use('/api/images' , imageRoutes)

//db connection
connectDB()

const port = 5000;

app.listen(port , () => {
    console.log(`server is running on  ${port}`)
})