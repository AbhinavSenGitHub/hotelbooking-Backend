const mongoose = require("mongoose")

const citySchema = new mongoose.Schema({
    name: { type: String },
    state: { type: String }
})

module.exports = mongoose.model("City", citySchema)