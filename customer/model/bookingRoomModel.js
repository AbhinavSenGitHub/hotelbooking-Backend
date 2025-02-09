const mongoose = require("mongoose")

// const bookingSchema = new mongoose.Schema({
//     accountOwnerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
//     hotelId: { type: mongoose.Schema.Types.ObjectId, ref: 'hotelModel', default: null },
//     roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'roomModel', default: null },
//     checkinDate: { type: Date, required: true },
//     checkoutDate: { type: Date, required: true },
//     checkinTime: { type: String, required: true },
//     checkoutTime: { type: String, required: true },
//     numberOfGuests: { type: Number, required: true },
//     totalAmount: { type: Number, required: true },
//     nextAvailability: { type: Date, required: true },
//     paymentStatus: { type: String, required: true, enum: ['Paid', 'Pending', 'Failed'] },
//     bookingDate: { type: Date},
//     status: { type: String, enum: ['Confirmed', 'Available', 'Canceled'], default: 'Available' },
// }, { timestamps: true })

// module.exports = mongoose.model('bookingRoom', bookingSchema)

const bookingSchema = new mongoose.Schema({
    accountOwnerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    hotelId: { type: mongoose.Schema.Types.ObjectId, ref: 'hotelowners', default: null },
    roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'rooms', default: null },
    checkinDate: { type: Date, required: true },
    checkoutDate: { type: Date, required: true },
    checkinTime: { type: String, required: true },
    checkoutTime: { type: String, required: true },
    numberOfGuests : { type: Number, required: true },
    bookingName: {type: String, required: true},
    bookingEmail: { type: String, required: true},
    bookingContact: { type: Number, required: true},
    amount: {type: Number, required: true},
    bookingDate: {type: Date},
    paymentStatus: {type: String},
})

module.exports = mongoose.model('bookingRoom', bookingSchema)