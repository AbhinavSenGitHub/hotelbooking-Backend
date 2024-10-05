const roomModel = require("../model/roomModel")
const { cloudinary, uploadImageToCloudinary } = require("../../config/cloudinaryConfig")
const { v4: uuidv4 } = require('uuid');
const multer = require('multer');
module.exports = {
    createRoom: async (req, res) => {

        try {
            const { keyPoints, ...otherRoomData } = req.body;

            console.log("room datqa ", keyPoints, otherRoomData);
            console.log(req.files);

            let imageUploadPromises = [];
            if (req.files && req.files.length > 0) {
                imageUploadPromises = req.files.map((file) => {
                    console.log(file.buffer)
                    return uploadImageToCloudinary(file.buffer);
                })
            }
            console.log("imageUploadPromises url :- ", imageUploadPromises)
            let imageUrls = []
            try {
                imageUrls = await Promise.all(imageUploadPromises);
                console.log("Uploaded Image URLs: ", imageUrls);
            } catch (error) {
                console.error("Error uploading images: ", error);
            }
            console.log(" Image URLs: ", imageUrls);

            // Create the new hotel object
            const newRoom = new roomModel({
                ...otherRoomData,
                keyPoints: JSON.parse(keyPoints),
                roomImages: imageUrls, // Store the uploaded image URLs
            })

            console.log("newRoom data", newRoom)
            await newRoom.save()

            res.status(200).json({ success: true });
        } catch (error) {
            console.error('Error adding room:', error);
            res.status(500).json({ success: false, message: error.message });
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
            const rooms = await roomModel.aggregate([
                {
                    $lookup: {
                        from: 'hotelowners',
                        localField: 'roomHotel_Id',
                        foreignField: '_id',
                        as: 'hotelDetails'
                    }
                },
                { $unwind: '$hotelDetails' },
                {
                    $project: {
                        _id: 1,
                        roomNumber: 1,
                        isBooked: 1,
                        roomImages: 1,
                        floorNumber: 1,
                        numberOfBed: 1,
                        price: 1,
                        capacity: 1,
                        bathRoom: 1,
                        'hotelDetails.hotelName': 1, // Get hotel name
                        'hotelDetails.hotelAddress': 1,
                        'hotelDetails.city': 1,
                        'hotelDetails.bookingContact': 1,
                    }
                }
            ])
            console.log("rooms:- ", rooms)
            res.status(200).json({ rooms });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }




        // try {
        //     const response = await roomModel.find()

        //     if (!response) {
        //         return res.status(404).json({ status: 404, success: false, message: "Room not found" })
        //     }
        //     return res.status(200).json({ status: 200, success: true, message: "All room fetched successfully", response: response });
        // } catch (error) {
        //     return res.status(404).json({ status: 500, success: false, message: "Internal server error" });
        // }
    }
}