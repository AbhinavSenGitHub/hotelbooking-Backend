const passport = require("../../config/passport")
const { bookingRoom, fetchAllBookingByCustomerId, updateByBookingId, cancelBooking } = require("../controller/bookingRoomController")

const router = require("express").Router()

router.post("/customer/booking", passport.authenticate("jwt", {session: false}), bookingRoom)

router.get("/customer/booking/:customerId", passport.authenticate("jwt", {session: false}), fetchAllBookingByCustomerId)

router.patch("/customer/booking/update/:bookingId", passport.authenticate("jwt", {session: false}), updateByBookingId)

router.patch("/customer/booking/update/:bookingId/cancel", passport.authenticate("jwt", {session: false}), cancelBooking)

module.exports = router