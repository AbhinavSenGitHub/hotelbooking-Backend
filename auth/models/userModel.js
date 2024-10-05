const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")
const userSchema = new mongoose.Schema({
    username: { type: String, required: true},
    email: {type: String, required: true},
    password: { type: String, required: true},
    userType: { type: String, enum:['customer', 'hotelOwner'], required: true},
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