//require('dotenv').config({path: './env'})  -> it will work absolutely fine but to optimize it use " import dotenv from "dotenv"  dotenv.config({path: './env'}) " and write " -r dotenv/config --experimental-json-modules " in package.json file in dev
import dotenv from "dotenv"
import connectDB from "./db/index.js";

dotenv.config({path: './env'})

// SECOND APPROACH (BETTER APPROACH) -> ek alag folder m sara code likhe or vha se export kraye or index file me sirf us function ko import kraye
connectDB()
.then(() => {
    app.on("error", (error) => {
            console.log("ERROR: ", error);
            throw error
        })
    app.listen(process.env.PORT || 8000, () => {
        console.log(` Server is running at port : ${process.env.PORT}`);
    })
})
.catch((err) => {
    console.log("MONGODB connection failed !!! ", err);
})








/*
FIRST APPROACH

import express from "express";
const app = express();
(async () => {
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        app.on("error", (error) => {
            console.log("ERROR: ", error);
            throw error
        })

        app.listen(process.env.PORT, () => {
            console.log(`App is listening on port ${process.env.PORT}`);
        })
    } catch (error) {
        console.error("ERROR: ", error)
        throw error
    }
})()
*/