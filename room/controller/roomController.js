const roomModel = require("../model/roomModel")
const { cloudinary, uploadImageToCloudinary } = require("../../config/cloudinaryConfig")
const { v4: uuidv4 } = require('uuid');
const { ObjectId } = require('mongodb');
const multer = require('multer');
const { default: mongoose } = require("mongoose");
module.exports = {
    createRoom: async (req, res) => {

        try {
            const { keyPoints, ...otherRoomData } = req.body;

            // console.log("room datqa ", keyPoints, otherRoomData);
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

            res.status(200).json({ success: true, message: "Room added to your hotel successfully", severity: "success" });
        } catch (error) {
            console.error('Error adding room:', error);
            res.status(500).json({ success: false, message: "Error in adding room to your hotel.", severity: "error" });
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

            console.log("Request Body:", req.body); // Form fields
            console.log("Uploaded Files:", req.files); // Uploaded files
            const roomId = req.params.roomId; // Ensure this matches how you define your route  

            // delete the image from the cloud
            if (req.body.deletedImages) {

                const urlToDelete = req.body.deletedImages.split(",")
                for (const url of urlToDelete) {
                    const publicId = url.split("/").pop().split(".")[0];
                    console.log("public Id ", publicId)
                    try {
                        const result = await cloudinary.uploader.destroy(publicId);
                        const response = await roomModel.updateMany(
                            { roomImages: url },
                            { $pull: { roomImages: url } }
                        )

                        console.log("Delete result:", result)
                        console.log("Delete response:", response)

                    } catch (error) {
                        console.error("Error deleting image:", error);
                    }
                }
            }
            let existingImage = []
            if (req.body.roomImages) {
                existingImage = req.body.roomImages.split(',')
                console.log("", existingImage)
            }
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

            const updatedRoomData = await roomModel.findByIdAndUpdate(
                roomId, // The actual room ID  
                {
                    roomNumber: req.body.roomNumber,
                    isBooked: req.body.isBooked || false, // Default to false if not provided  
                    city: req.body.city,
                    state: req.body.state,
                    country: req.body.country,
                    fullAddress: req.body.fullAddress,
                    roomImages: [...existingImage, ...imageUrls] || [], // Default to empty array if not provided  
                    floorNumber: req.body.floorNumber,
                    numberOfBed: req.body.numberOfBed,
                    price: req.body.price,
                    capacity: req.body.capacity,
                    bathRoom: req.body.bathRoom,
                    description: req.body.description,
                    amenities: req.body.amenities || [], // Default to empty array if not provided  
                    availabilityDates: req.body.availabilityDates  // Default to empty array if not provided  
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
                        description: 1,
                        keyPoints: 1,
                        price: 1,
                        capacity: 1,
                        bathRoom: 1,
                        'hotelDetails.hotelName': 1, // Get hotel name
                        'hotelDetails.hotelAddress': 1,
                        'hotelDetails.city': 1,
                        'hotelDetails.bookingContact': 1,
                        'hotelDetails._id': 1,
                    }
                }
            ])
            // console.log("rooms:- ", rooms)
            res.status(200).json({ rooms });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    searchRoomByHotelId: async (req, res) => {
        const { hotelId, selectedField, selectedValue } = req.query;

        console.log("search fields", selectedValue, selectedField, hotelId);

        try {
            // Construct dynamic filter
            const objectId = new mongoose.Types.ObjectId(hotelId);
            const roomNumber = 21

            console.log("id, roomNumber", objectId, roomNumber)

            let rooms = ""
            if (selectedField === 'floorNumber') {

                rooms = await roomModel.find({
                    roomHotel_Id: objectId,
                    floorNumber: selectedValue
                })
            } else if (selectedField === 'floorNumber') {

                rooms = await roomModel.find({
                    roomHotel_Id: objectId,
                    roomNumber: selectedValue
                })
            }

            console.log("rooms: ", rooms)
            return res.status(200).json({
                status: 200,
                data: rooms,
            });
        } catch (error) {
            console.error("Error: ", error);
            return res.status(500).json({
                status: 500,
                message: "Internal Server Error: " + error.message,
            });
        }
    }

}