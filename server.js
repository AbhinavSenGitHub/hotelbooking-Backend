require("dotenv").config()

const express = require("express")
const cors = require("cors")
const cookieParser = require("cookie-parser")
const session = require("express-session")
const passport = require("passport")
const db = require("./config/db")
const MongoStore = require("connect-mongo")
const googleStrategy = require("passport-google-oauth20").Strategy
// PORT
const PORT = process.env.PORT || 8082

// use
const app = express()
app.use(express.urlencoded({extended: true}))
// app.use(cors({origin: "*"}))
app.use(cors({
    origin: 'http://localhost:3000', // Allow requests from Google OAuth endpoint
    methods: 'GET, POST, PUT, DELETE',
    allowedHeaders: 'Content-Type, Authorization',
    credentials: true // Allow credentials (e.g., cookies, HTTP authentication)
  }));
// middleware
app.use(express())
app.use(express.json())
app.use(cookieParser())
app.use(session({
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.DB_URL}),
    cookie: {  
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds  
    httpOnly: true,  // for security, to prevent XSS attacks  
    secure: process.env.NODE_ENV === 'production',
  }  

}))
app.use(passport.initialize())
app.use(passport.session())

// router import

//google auth
const googleAuth = require("./auth/routes/userRouter")
// user route
const userRouter = require("./auth/routes/userRouter")

// hotel owner route
const createHotelRoute = require("./hotelOwner/route/createHotelRoute")
const roomRoute = require("./room/route/roomRoute")

// customer route
const customer = require("./customer/route/bookingRoomRoute")

// router linked
app.use("/", userRouter)
app.use("/", createHotelRoute)
app.use("/", roomRoute)
app.use("/", customer)
app.use("/", googleAuth)
// listining to port
app.listen(PORT, (error, res) => {
    if(error) {
        console.log("Error in kaing the request to PORT:- ", PORT)
    }else{
        console.log("Server is running on port ", PORT)
    }
})
