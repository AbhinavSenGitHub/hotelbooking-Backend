const userController = require("../contorllers/userController")
const passport = require("passport")
const router = require("express").Router()

// request
router.post('/auth/signup', userController.signupUser)
router.post('/verify-otp', userController.verifyOTP); // verify email
router.post('/resend-otp', userController.resendOTP); // verify email
router.post('/auth/login', userController.loginUser)
router.get('/auth/cookies', userController.fetchCookies)

// google authentication 
router.get('/auth/google', async (req, res, next) => {
    const userType = req.query.userType || 'customer';  // Get the userType
    const state = JSON.stringify({ userType });
    console.log("user session", req.session, "userType:----", userType);
    passport.authenticate('google', {
        scope: ['profile', 'email'],
        state: state,  // Pass state containing userType
    })(req, res, next); 
}); 

router.get(
    "/auth/google/callback",
    passport.authenticate("google", { failureRedirect: "/" }),
    userController.googleAuthCallback
);

router.get("/logout", userController.googleLogout);

router.get('/auth/logout', (req, res) => {
    req.logout((err) => {
        if (err) {
            console.error("Error logging out:", err);
            return res.json({ status: 500, success: false, message: "Logout failed" });
        }
        req.session.destroy( () => {
            res.clearCookie("authCookies", { path: '/' })
            console.log("logout successfully");
            res.json({status: 200, success: true, message: " Logout successfully "})
        })
    });
});

module.exports = router