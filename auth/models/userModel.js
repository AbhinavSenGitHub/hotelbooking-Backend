const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")
const userSchema = new mongoose.Schema({
    username: { 
        type: String, 
        required: false // Set to false, will validate inside pre-save middleware
    },
    email: { 
        type: String, 
        unique: true, 
        required: false // Set to false, will validate inside pre-save middleware
    },
    password: { 
        type: String, 
        required: false // Set to false, will validate inside pre-save middleware
    },
    userType: { 
        type: String, 
        enum: ['customer', 'hotelOwner'],
        required: false // Set to false, will validate inside pre-save middleware
    },
    googleId: {
        type: String, // For Google OAuth
        required: false
    },
    isVerified: { type: Boolean, default: false },
    otp: { type: String },
    otpExpiresAt: { type: Date }
})

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }
    try{
        this.password = await bcrypt.hash(this.password, 10);
        next();
    }catch(error ){
        next(error)
    }
});

userSchema.methods.comparePassword = function (candidatePassword) {
    try{
        return bcrypt.compare(candidatePassword, this.password);
    }catch(error) {
        throw new Error("Password comparsion failed")
    }  
}

const User = mongoose.model("users", userSchema)
module.exports = User