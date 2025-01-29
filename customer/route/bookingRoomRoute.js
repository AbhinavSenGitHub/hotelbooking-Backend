const mixedAuth = require("../../config/googlePassport")
const passport = require("../../config/passport")
const { bookingRoom, fetchAllBookingByCustomerId, updateByBookingId, cancelBooking, searchRooms, bookingRooms, finalizeBooking } = require("../controller/bookingRoomController")

const router = require("express").Router()

router.post("/customer/booking", mixedAuth, bookingRoom)

router.post("/create-checkout-session", mixedAuth, bookingRooms)
router.post("/finalize-booking", mixedAuth, finalizeBooking)

router.get("/customer/booking/", mixedAuth, fetchAllBookingByCustomerId)

router.patch("/customer/booking/update/:bookingId", mixedAuth, updateByBookingId)

router.patch("/customer/booking/update/:bookingId/cancel", mixedAuth, cancelBooking)

router.get("/search-rooms/:location/:checkIn/:checkOut", searchRooms)

module.exports = router

// passport.authenticate("jwt", {session: false})