const passport = require("../../config/passport")
const router = require("express").Router();
const {createHotel, updateHotel, deleteHotel, getAllHotelsOfOwner, getAllHotel, searchHotelByLocation} = require("../controller/createHotel")

router.post("/hotel-owner/add-hotel", passport.authenticate('jwt', { session: false }), createHotel)

router.put("/hotel-owner/update-hotel/:hotelId", passport.authenticate('jwt', {session: false}), updateHotel)

router.delete("/hotel-owner/delete-hotel/:hotelId", passport.authenticate('jwt', {session: false}), deleteHotel)

router.get("/hotel-owner/get-ownerhotel", passport.authenticate('jwt', {session: false}), getAllHotelsOfOwner)

router.get("/getall-hotel", getAllHotel)

router.get("/hotel-by-location", searchHotelByLocation)

module.exports = router