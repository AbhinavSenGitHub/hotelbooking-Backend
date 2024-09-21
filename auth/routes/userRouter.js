const userController = require("../contorllers/userController")
const passport = require("passport")
const router = require("express").Router()

// request
router.post('/auth/signup', userController.signupUser)
router.post('/auth/login', userController.loginUser)

// google authentication 
router.get('/auth/google', passport.authenticate('google', { scope: ['profile'] }))
router.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/login' }),
    function (req, res) {
        // Successful authentication, redirect home.
        res.redirect('/');
    });
    
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