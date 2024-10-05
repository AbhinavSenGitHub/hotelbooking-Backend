const mongoose = require("mongoose")
 
const roomSchema = new mongoose.Schema({
    roomId: { type: String,  unique: true },
    roomHotel_Id: { type: mongoose.Schema.Types.ObjectId, ref: "hotelowners"},
    roomOwner_Id: { type: mongoose.Schema.Types.ObjectId, ref: "users", default: null }, // Referencing the customer who booked the room
    roomNumber: { type: String, required: true },
    isBooked: { type: Boolean, default: false },
    roomImages: [{ type: String }],
    keyPoints: [ { type: Map, of: String}],
    floorNumber: { type: Number, required: true },
    numberOfBed: { type: Number, required: true },
    price: { type: Number, required: true },
    capacity: { type: Number, required: true },
    bathRoom: { type: Boolean, required: true },
    description: { type: String},
    amenities: [{ type: String }], // Optional field for room amenities
    availabilityDates: [{ startDate: Date, endDate: Date }], // Optional field for tracking availability ranges 
})

module.exports = mongoose.model("rooms", roomSchema)