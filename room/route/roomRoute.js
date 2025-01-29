const { upload } = require("../../config/cloudinaryConfig")
const mixedAuth = require("../../config/googlePassport")
const passport = require("../../config/passport")
const { createRoom, getRoomsById, updateRoom, deleteRoom, getAllRoom, searchRoomByHotelId } = require("../controller/roomController")
const router = require("express").Router()

router.post("/hotel-owner/create-room", mixedAuth, upload.array("roomImage", 7),  createRoom)

router.get("/hotel-owner/gethotel-by_id/:hotelId", mixedAuth, getRoomsById)

router.patch("/hotel-owner/update-room/:roomId", mixedAuth, upload.array("newImages", 7), updateRoom)

router.delete("/hotel-owner/delete-room/:roomId", mixedAuth,  deleteRoom)

router.get("/hotel-owner/getall-room", getAllRoom)

router.get("/search-room-byhotel", mixedAuth, searchRoomByHotelId)

module.exports = router 