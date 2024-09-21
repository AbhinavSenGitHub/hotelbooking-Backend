const roomModel = require("../model/roomModel")
const { v4: uuidv4 } = require('uuid');
module.exports = {
    createRoom: async (req, res) => {
        try {

            const roomId = uuidv4();
            const roomData = new roomModel({
                roomNumber: req.body.roomNumber,
                roomId: roomId,
                roomHotel_Id: req.body.roomHotel_Id,
                roomOwner_Id: req.body.roomOwner_Id || null, // Optional, can be null  
                isBooked: req.body.isBooked || false, // Default to false if not provided  
                roomImages: req.body.roomImages || [], // Default to empty array if not provided  
                floorNumber: req.body.floorNumber,
                numberOfBed: req.body.numberOfBed,
                price: req.body.price,
                capacity: req.body.capacity,
                bathRoom: req.body.bathRoom,
                description: req.body.description,
                amenities: req.body.amenities || [], // Default to empty array if not provided  
                availabilityDates: req.body.availabilityDates || [] // Default to empty array if not provided  
            });
            console.log(roomData)
            await roomData.save()
            res.status(201).json({
                status: 201,
                message: 'Room created successfully',
            });
        } catch (error) {
            console.error("Error in making the port request", error)
            return res.status(500).json({ status: 500, success: false, message: "Internal Server Error" })
        }
    },

    getRoomsById: async (req, res) => {

        const hotelId = req.params.hotelId
        try {
            const response = await roomModel.find({ roomHotel_Id: hotelId })
            console.log("response: ", response)

            return res.status(200).json({ status: 200, success: true, message: "Succeffuly fetched the room", data: response })
        } catch (error) {
            console.error("Internal server error", error)
            return res.status(500).json({ status: 500, success: false, message: "Internal Server Error" })
        }
    },

    updateRoom: async (req, res) => {
        try {
            const roomId = req.params.roomId; // Ensure this matches how you define your route  

            const updatedRoomData = await roomModel.findByIdAndUpdate(
                roomId, // The actual room ID  
                {
                    roomNumber: req.body.roomNumber,
                    isBooked: req.body.isBooked || false, // Default to false if not provided  
                    city: req.body.city,
                    state: req.body.state,
                    country: req.body.country,
                    fullAddress: req.body.fullAddress,
                    roomImages: req.body.roomImages || [], // Default to empty array if not provided  
                    floorNumber: req.body.floorNumber,
                    numberOfBed: req.body.numberOfBed,
                    price: req.body.price,
                    capacity: req.body.capacity,
                    bathRoom: req.body.bathRoom,
                    description: req.body.description,
                    amenities: req.body.amenities || [], // Default to empty array if not provided  
                    availabilityDates: req.body.availabilityDates || [] // Default to empty array if not provided  
                },
                { new: true } // Return the updated document  
            );

            if (!updatedRoomData) {
                return res.status(404).json({ status: 404, success: false, message: "Room not found" });
            }

            console.log("updatedRoomData:- ", updatedRoomData);
            return res.status(200).json({ status: 200, success: true, message: "Room successfully updated", response: updatedRoomData });

        } catch (error) {
            console.error("Internal server error", error);
            return res.status(500).json({ status: 500, success: false, message: "Internal server error" });
        }
    },

    deleteRoom: async (req, res) => {
        try {
            const roomId = req.params.roomId;
            const deleteRoomData = await roomModel.findByIdAndDelete(roomId);

            if (!deleteRoomData) {
                return res.status(404).json({ status: 404, success: false, message: "Room not found" });
            }

            return res.status(200).json({ status: 200, success: true, message: "Room deleted successfully" });
        } catch (error) {
            console.error("Internal server error", error);
            return res.status(500).json({ status: 500, success: false, message: "Internal server error" });
        }
    },

    getAllRoom: async (req, res) => {
        try {
            const response = await roomModel.find()

            if (!response) {
                return res.status(404).json({ status: 404, success: false, message: "Room not found" })
            }
            return res.status(200).json({ status: 200, success: true, message: "All room fetched successfully", response: response });
        } catch (error) {
            return res.status(404).json({ status: 500, success: false, message: "Internal server error" });
        }
    }
}