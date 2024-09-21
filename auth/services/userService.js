const User = require("../models/userModel")
const jwtUtils = require("../../utils/jwtUtils")
module.exports = {

    signupUser: async (userData) => {
        try {
            const userExists = await User.findOne({ email: userData.email })
            console.log("userExists", userExists)
            if (userExists) {
                console.log("User already exists")
                return { status: 409, success: false, message: "User already exists" }
            } else {
                console.log("User not exists", userData)
                const newUser = new User(userData)
                await newUser.save()
                const token = jwtUtils.generateToken(newUser)
                return { status: 201, success: true, token: token, message: "User signup successfully" }
            }
        } catch (error) {
            console.error("Error in making the request ", error)
            return { success: false, message: "Error in registering user" }
        }
    },

    loginUser: async (email, password, req) => {
        try {
            const userExists = await User.findOne({ email })
            if (!userExists || !(await userExists.comparePassword(password))) {
                return { status: 401, success: false, message: "Invalid username or password" }
            }
            const token = jwtUtils.generateToken(userExists)

            // Store user ID in session
            console.log("userExists", userExists)
            req.session.userId = userExists._id;
            console.log("user req session and it's _id ", req.session.userId )

            return { status: 200, success: true, token: token, message: "User login successfully", 
                userData: {
                        username: userExists.username,
                        email: userExists.email,
                        userType: userExists.userType
                    }
             }
        } catch (error) {
            console.error("Error in login ", error)
            return { success: false, message: "Internal server error" }
        }
    },

    getUserById: async (id) => {
        console.log("user id:-", id)
        return User.findById(id);
    }
}   