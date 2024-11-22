const userService = require("../services/userService")

module.exports = {

    signupUser: async (req, res) => {

        console.log("inside the server: ", req.body)
        const userData = {
            username: req.body.username,
            email: req.body.email,
            password: req.body.password,
            userType: req.body.userType
        }

        try{
            const response = await userService.signupUser(userData)
            
            if(response.success){
                console.log("response in the cookie", response)
                res.cookie("authCookies", response, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 })
                return res.json({
                    status: response.status,
                    success: response.success,
                    message: response.message,
                    token: response.token,
                    severity: response.severity,
                    userData: {
                        username: userData.username,
                        email: userData.email,
                        userType: userData.userType
                    }
                })
            }else{
                return res.json({
                    status: response.status,
                    success: response.success,
                    message: response.message,
                    severity: response.severity
                })
            }

        }catch(error) {
            console.log("Error in making  the request:- ", error)
            return res.json({
                status: 501,
                success: false,
                message: "Internal server error"
            })
        }
    }, 

    loginUser: async (req, res, next) => {
        try{
            const { email, password } = req.body;
            const response = await userService.loginUser(email, password, req)
            console.log("user: ", response)
            if(response.success){
                res.cookie("authCookies", response, { httpOnly: true })
                return res.json({
                    status: response.status,
                    success: response.success,
                    message: response.message,
                    token: response.token,
                    severity: response.severity,
                    userData: {
                        username: response.userData.username,
                        email: response.userData.email,
                        userType: response.userData.userType
                    }
                    
                })
            }
            if(!response.success){
                return res.json({
                    status: response.status,
                    success: response.success,
                    message: response.message,
                    token: response.token,
                    severity: response.severity
                })
            }
        }catch(error) {
            console.log("Error in sending request to backend")
            next(error)
        }
    },

    fetchCookies : async (req, res) => {
        const authCookies = req.cookies.authCookies

        console.log("fetching cookies", authCookies)

        if(authCookies){
            return res.status(200).json({
                status: 200,
                success: true,
                message: "Cookie found",
                authCookies: authCookies,
                severity: "success",
            })
        }else{
            return res.status(404).json({
                status: 404,
                success: false,
                message: "Cookie not found",
                authCookies: authCookies,
                severity: "error",
            })
        }
    }

    
}