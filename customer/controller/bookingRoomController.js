const dateFormate = require("../../common/date")
const bookingRoomModel = require("../model/bookingRoomModel")
const moment = require("moment")

module.exports = {
    bookingRoom: async (req, res) => {
        try {
            const currentDate = dateFormate(Date())
            let checkinDate = moment(req.body.checkinDate, "DD-MM-YYYY")
            let checkoutDate = moment(req.body.checkoutDate, "DD-MM-YYYY")
            const nextAvailabilityDate = moment(checkoutDate).add(1, 'days').format("DD-MM-YYYY")

            if (!checkinDate.isValid() || !checkoutDate.isValid()) {
                return res.status(400).json({
                    status: 400,
                    success: false,
                    message: "Invalid date format. Please use 'DD-MM-YYYY' format."
                });
            }
            checkinDate = checkinDate.format("DD-MM-YYYY")
            checkoutDate = checkoutDate.format("DD-MM-YYYY")



            console.log("booking room", req.user._id)
            const newBooking = new bookingRoomModel({
                accountOwnerId: req.user._id,
                hotelId: req.body.hotelId,
                roomId: req.body.roomId,
                checkinDate: checkinDate,
                checkoutDate: checkoutDate,
                checkinTime: req.body.checkinTime,
                checkoutTime: req.body.checkoutTime,
                numberOfGuests: req.body.numberOfGuests,
                nextAvailability: nextAvailabilityDate,
                totalAmount: req.body.totalAmount,
                paymentStatus: req.body.paymentStatus,
                bookingDate: currentDate,
                status: req.body.status,
            })
            
            await newBooking.save()
            res.status(201).json({
                status: 201,
                success: true,
                message: 'Room booked successfully'
            })
        } catch (error) {
            console.error(error)
            return res.status(500).json({ status: 500, success: false, message: "Internal Server Error" })
        }
    },

    fetchAllBookingByCustomerId: async (req, res) => {
        try {
            const customerId = req.params.customerId

            const responseById = await bookingRoomModel.find({ accountOwnerId: customerId })

            console.log("response ", responseById)
            return res.status(200).json({ status: 200, success: true, message: "fetched successfully", response: responseById })

        } catch (error) {
            console.error(error)
            return res.status(500).json({ status: 500, success: false, message: "Internal Server Error" })
        }
    },

    updateByBookingId: async (req, res) => {
        try {
            const currentDate = dateFormate(Date())

            const booking_Id = req.params.bookingId
            console.log("booking_Id", booking_Id)
            
            let checkinDate = moment(req.body.checkinDate, "DD-MM-YYYY")
            let checkoutDate = moment(req.body.checkoutDate, "DD-MM-YYYY")
            const nextAvailabilityDate = moment(checkoutDate).add(1, 'days').format("DD-MM-YYYY")

            if (!checkinDate.isValid() || !checkoutDate.isValid()) {
                return res.status(400).json({
                    status: 400,
                    success: false,
                    message: "Invalid date format. Please use 'DD-MM-YYYY' format."
                });
            }
            checkinDate = checkinDate.format("DD-MM-YYYY")
            checkoutDate = checkoutDate.format("DD-MM-YYYY")

            const updateBooking = {
                checkinDate: checkinDate,
                checkoutDate: checkoutDate,
                numberOfGuests: req.body.numberOfGuests,
                nextAvailability: nextAvailabilityDate,
                bookingDate: currentDate,
                status: req.body.status,
            }
            const response = await bookingRoomModel.findByIdAndUpdate(booking_Id, updateBooking, {
                new: true,
                runValidators: true
            })
            if (!response) {
                return res.status(404).json({ status: 404, message: "Booking with this credentials not found" })
            }
            return res.status(200).json({ status: 200, success: true, message: "Booking updated successfully" })
        } catch (error) {
            console.error(error)
            return res.status(500).json({ status: 500, success: false, message: "Internal Server Error" })
        }
    },

    cancelBooking: async (req, res) => {
        try {
            const bookingId = req.params.bookingId
            const newUpdate = {
                status: 'Canceled'
            }
            const updateBooking = await bookingRoomModel.findByIdAndUpdate(bookingId, newUpdate, {
                new: true,
                runValidators: true
            })

            if (!updateBooking) {
                return res.status(404).json({ status: 400, success: false, message: "Booking not found" })
            }
            return res.status(200).json({ status: 200, success: false, message: "Booking canceled successfully" })

        } catch (error) {
            console.error(error)
            return res.status(500).json({ status: 500, success: false, message: "Internal Server Error" })
        }
    }
}
