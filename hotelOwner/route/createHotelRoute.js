const passport = require("../../config/passport")
const router = require("express").Router();
const {createHotel, updateHotel, deleteHotel, getAllHotelsOfOwner, getAllHotel, searchHotelByLocation, getAllLocation, searchOwnerHotel} = require("../controller/createHotel")
const { upload } = require("../../config/cloudinaryConfig");  // Multer upload middleware
const mixedAuth = require("../../config/googlePassport");
// router.post(
//     "/hotel-owner/add-hotel", 
//     passport.authenticate('jwt', { session: false }),
//     upload.array("images", 7),
//     createHotel)
router.post(
    "/hotel-owner/add-hotel", 
    mixedAuth,
    upload.array("images", 7),
    createHotel)

router.patch("/hotel-owner/update-hotel/:hotelId", mixedAuth, upload.array("newImages", 7), updateHotel)

router.delete("/hotel-owner/delete-hotel/:hotelId", mixedAuth, deleteHotel)

router.get("/hotel-owner/get-ownerhotel", mixedAuth, getAllHotelsOfOwner)

router.get("/getall-hotel", getAllHotel)

router.get("/hotel-by-location", searchHotelByLocation)

router.get("/all-location", getAllLocation)

router.get("/search-owner-hotel", mixedAuth, searchOwnerHotel)
module.exports = router




// passport.authenticate('jwt', {session: false})