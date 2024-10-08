const { upload } = require("../../config/cloudinaryConfig")
const passport = require("../../config/passport")
const { createRoom, getRoomsById, updateRoom, deleteRoom, getAllRoom } = require("../controller/roomController")
const router = require("express").Router()

router.post("/hotel-owner/create-room", passport.authenticate('jwt', { session: false }), upload.array("roomImage", 7),  createRoom)

router.get("/hotel-owner/gethotel-by_id/:hotelId", passport.authenticate('jwt', { session: false }), getRoomsById)

router.put("/hotel-owner/update-room/:roomId", passport.authenticate('jwt', { session: false }), updateRoom)

router.delete("/hotel-owner/delete-room/:roomId", passport.authenticate('jwt', { session: false }), deleteRoom)

router.get("/hotel-owner/getall-room", getAllRoom)

module.exports = router 