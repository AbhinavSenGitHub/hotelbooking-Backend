const userService = require("../services/userService")
const userModel = require("../models/userModel")
const crypto = require('crypto');
const sendEmail = require("../../config/emailConfig");

const generateOTP = () => {
    return crypto.randomInt(100000, 999999).toString();
};

module.exports = {

    signupUser: async (req, res) => {

        console.log("inside the server: ", req.body)
        const otp = generateOTP();
        const otpExpiresAt = new Date(Date.now() + 60 * 1000); // OTP valid for 1 minute
        const userData = {
            username: req.body.username,
            email: req.body.email,
            password: req.body.password,
            userType: req.body.userType,
            otp: otp,
            otpExpiresAt: otpExpiresAt
        }

        try {
            const response = await userService.signupUser(userData)
            // Send OTP email
            await sendEmail(req.body.email, otp, 'Email Verification');

            if (response.success) {
                console.log("response in the cookie", response)
                res.cookie("authCookies", response.userData, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 })
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
            } else {
                return res.json({
                    status: response.status,
                    success: response.success,
                    message: response.message,
                    severity: response.severity
                })
            }

        } catch (error) {
            console.log("Error in making  the request:- ", error)
            return res.json({
                status: 501,
                success: false,
                message: "Internal server error"
            })
        }
    },

    verifyOTP: async (req, res) => {
        const { otpString, email } = req.body;
        console.log('Varificaton: ', req.body)
        try {
            const user = await userModel.findOne({ email });

            if (!user) {
                return res.status(404).json({ message: 'User not found.', severity: "info" });
            }

            if (user.isVerified) {
                return res.status(400).json({ message: 'User already verified.', severity: "info" });
            }

            if (user.otp !== otpString || user.otpExpiresAt < Date.now()) {
                return res.status(400).json({ message: 'Invalid or expired OTP.', severity: "info" });
            }

            // Mark user as verified and clear OTP fields
            user.isVerified = true;
            user.otp = undefined;
            user.otpExpiresAt = undefined;
            await user.save();
            res.status(200).json({ message: 'User verified successfully.', severity: "success" });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    resendOTP: async (req, res) => {
        const { otpString, email } = req.body;

        try {
            // Check if the user exists
            const user = await userModel.findOne({ email });
            if (!user) {
                return res.status(404).json({ message: 'User not found.', severity: "info" });
            }

            if (user.isVerified) {
                return res.status(400).json({ message: 'User already verified.', severity: "info" });
            }

            // Generate a new OTP
            const otp = crypto.randomInt(100000, 999999).toString();
            const otpExpiresAt = new Date(Date.now() + 60 * 1000); // OTP valid for 1 minute

            // Update OTP and expiration in the database
            user.otp = otp;
            user.otpExpiresAt = otpExpiresAt;
            console.log("user object", user)
            await user.save();

            // Send the new OTP email
            await sendEmail(
                email,
                otp,
                'Resend OTP - Email Verification'
            );

            res.status(200).json({ message: 'Resent OTP successfully.', severity: "success" });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    loginUser: async (req, res, next) => {
        try {
            const { email, password } = req.body;
            const response = await userService.loginUser(email, password, req)
            console.log("user: ", response)
            if (response.success) {
                res.cookie("authCookies", response.userData, { httpOnly: true })
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
            if (!response.success) {
                return res.json({
                    status: response.status,
                    success: response.success,
                    message: response.message,
                    token: response.token,
                    severity: response.severity
                })
            }
        } catch (error) {
            console.log("Error in sending request to backend")
            next(error)
        }
    },

    googleAuthCallback: async (req, res) => {
        try {
            const user = req.user;
            const state = req.query.state;
            const { userType } = JSON.parse(state);
          
            console.log("User Type from state:", userType);
            console.log("req user:- ", req.user, req.session)
            user.userType = userType;
            await user.save();
            res.cookie('authCookies', {
                username: user.username,
                email: user.email,
                googleId: user.googleId,
                userType: user.userType,
            });
            res.redirect("https://heavenstay-plum.vercel.app/display-rooms");  // Adjust this as per your frontend route
        } catch (error) {
            console.error("Error in Google Auth Callback:", error);
            res.status(500).json({ message: "Something went wrong." });
        }
    },

    googleLogout: async (req, res) => {
        req.logout((err) => {
            if (err) {
                console.error("Error during logout:", err);
                return next(err);
            }
            res.redirect("/");
        });
    },

    fetchCookies: async (req, res) => {
        const authCookies = req.cookies.authCookies

        console.log("fetching cookies", authCookies)

        if (authCookies) {
            return res.status(200).json({
                status: 200,
                success: true,
                message: "Cookie found",
                authCookies: authCookies,
                severity: "success",
            })
        } else {
            return res.status(404).json({
                status: 404,
                success: false,
                message: "Cookie not found",
                authCookies: authCookies,
                severity: "error",
            })
        }
    },


}