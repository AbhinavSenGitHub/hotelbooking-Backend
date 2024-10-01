const mongoose = requrie("mongoose")

const citySchema = new mongoose.Schema({
    name: { type: String },
    state: { type: String }
})

exports.City = mongoose.module("City", citySchema)