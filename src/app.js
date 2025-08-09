import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
//routes import
import userRouter from './routes/user.routes.js'
import videoRouter from './routes/video.routes.js'
import tweetRouter from './routes/tweet.routes.js'
import subscriptionRouter from './routes/subscription.routes.js'
import playlistRouter from './routes/playlist.routes.js'
import likeRouter from './routes/like.routes.js'
import commentRouter from './routes/comment.routes.js'

const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(express.json({limit: "16kb"}))  // kyuki data kai jga s ayege backend k and uske liye agr json se ayega to ye likna pdega
app.use(express.urlencoded({extended: true, limit: "16kb"})) // agr data as a url aye backend pr
app.use(express.static("public")) // agr jase kuch public(HTML CSS JS) asset ayege to uske liye h ye
app.use(cookieParser())

//routes declaration
app.use("/api/v1/users", userRouter)
app.use("/api/v1/users/video", videoRouter)
app.use("/api/v1/users/tweet", tweetRouter)
app.use("/api/v1/users/subscription", subscriptionRouter)
app.use("/api/v1/users/playlist", playlistRouter)
app.use("/api/v1/users/like", likeRouter)
app.use("/api/v1/users/comment", commentRouter)

// http://localhost:8000/api/v1/users/register

export { app }