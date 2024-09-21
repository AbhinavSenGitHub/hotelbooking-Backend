const mongoose = require("mongoose")
const URL = process.env.DB_URL
const connectDB = async () => {
    try{
        await mongoose.connect(URL)
        console.log("Connected to DB successfully")
    }catch (error) {
        console.log("Error in connecting to mongoDB: ", error)
    }
}
connectDB()
module.exports = mongoose