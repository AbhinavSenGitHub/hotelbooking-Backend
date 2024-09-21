const jwt = require("jsonwebtoken")
const config = require("config")

const generateToken = (user) => {
    const payload =  { id: user.id, email: user.email };
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "7d" })
}

module.exports = {
    generateToken,
}