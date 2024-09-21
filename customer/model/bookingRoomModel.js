const mongoose = require("mongoose")

const bookingSchema = new mongoose.Schema({
    accountOwnerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    hotelId: { type: mongoose.Schema.Types.ObjectId, ref: 'hotelModel', default: null },
    roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'roomModel', default: null },
    checkinDate: { type: String, requried: true },
    checkoutDate: { type: String, requried: true },
    numberOfGuests: { type: Number, requried: true },
    totalAmount: { type: Number, required: true },
    nextAvailability: { type: String, requried: true },
    paymentStatus: { type: String, required: true },
    bookingDate: { type: String},
    status: { type: String, enum: ['Confirmed', 'Available', 'Canceled'], default: 'Available' },
}, { timestamps: true })

module.exports = mongoose.model('bookingRoom', bookingSchema)