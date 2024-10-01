const { cloudinary, uploadImageToCloudinary } = require("../../config/cloudinaryConfig")
const hotelModel = require("../model/hotelModel")
const multer = require('multer');

// const storage = multer.memoryStorage(); // Store files in memory temporarily
// const upload = multer({ storage });

module.exports = {
    createHotel: async (req, res) => {
        try {
            const { keyPoints, ...otherHotelData } = req.body;
            console.log(req.user)
            console.log(keyPoints, otherHotelData);
            console.log(req.files);
            // If there are image files in the request, upload them to Cloudinary
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
            const newHotel = new hotelModel({
                ...otherHotelData,
                owner: req.user,
                keyPoints: JSON.parse(keyPoints), // Convert the string back to an array
                images: imageUrls, // Store the uploaded image URLs
            })

            console.log("newHotel data", newHotel)
            // Save new hotel (Mongoose model)
            await newHotel.save()

            res.status(200).json({ success: true });
        } catch (error) {
            console.error('Error adding hotel:', error);
            res.status(500).json({ success: false, message: error.message });
        }

        // console.log("user.id ", req.user)

        // console.log("req.body", req.files)
        // try {

        //     // upload image to cloudinary

        //     const imageFiles = req.files; // Access uploaded files
        //     console.log("imageurl: ", imageUrls);

        //     const imageUrls = await Promise.all(
        //         imageFiles.map(file => {
        //             return new Promise((resolve, reject) => {
        //                 const stream = cloudinary.uploader.upload_stream((error, result) => {
        //                     if (error) {
        //                         return reject(error);
        //                     }
        //                     resolve(result.secure_url);
        //                 });
        //                 stream.end(file.buffer);
        //             });
        //         })
        //     );

        //     console.log("imageurl: ", imageUrls);

        //     const hotelData = new hotelModel({
        //         owner: req.user._id,
        //         hotelName: req.body.hotelName,
        //         hotelDescription: req.body.hotelDescription,
        //         city: req.body.city,
        //         state: req.body.state,
        //         country: req.body.country,
        //         keyPoints: req.body.keyPoints || [],
        //         ownerContact: req.body.ownerContact,
        //         bookingContact: req.body.bookingContact,
        //         numberOfRooms: req.body.numberOfRooms,
        //         additionEmail: req.body.additionEmail,
        //         hotelAddress: req.body.hotelAddress,
        //         pincode: req.body.pincode,
        //         // images: imageUrls,          // Array of Cloudinary URLs
        //         // diningHall: req.body.diningHall,
        //     })
        //     await hotelData.save();
        //     req.session.hotelId = hotelData._id;
        //     console.log("req.session.hotelId:- ", req.session.hotelId)
        //     console.log("req.session:- ", req.session)

        //     req.session.save(err => {
        //         if (err) {
        //             console.log("Session save error: ", err)
        //             return res.status(500).json({ success: false, message: "Failed to save the session." })
        //         }
        //     })

        //     console.log("req.session after saving hotelId: ", req.session.hotelId)
        //     return res.status(201).json({ status: 201, success: true, message: "Hotel details saved successfully", hotelId: hotelData._id })
        // } catch (error) {
        //     console.error("Error in saving the hotel", error)
        //     return res.status(500).json({ status: 500, success: false, message: "Internal server error" })
        // }
    },

    updateHotel: async (req, res) => {
        console.log("update Hotel ")

        try {
            const hotel_Id = req.params.hotelId
            const owner_Id = req.user._id

            const hotel = await hotelModel.findOne({ _id: hotel_Id, owner: owner_Id })

            if (!hotel) {
                return res.status(404).json({ status: 404, success: false, message: "Couldn't find the hotel" })
            }

            const updatedHotel = await hotelModel.findByIdAndUpdate(
                hotel_Id,
                {
                    hotelName: req.body.hotelName,
                    hotelDescription: req.body.hotelDescription,
                    city: req.body.city,
                    state: req.body.state,
                    country: req.body.country,
                    numberOfRooms: req.body.numberOfRooms,
                    diningHall: req.body.diningHall,
                    image: req.body.image,
                    roomForFourMembers: req.body.roomForFourMembers,
                    roomForTwoMembers: req.body.roomForTwoMembers,
                    roomForOneMembers: req.body.roomForOneMembers
                },
                { new: true }
            )

            return res.status(200).json({ status: 200, success: true, message: "Updated successfully" })

        } catch (error) {
            console.error("Error in updating hotel: ", error)

            return res.status(500).json({ status: 500, success: false, message: "Internal Server Error" })
        }
    },

    deleteHotel: async (req, res) => {
        try {
            const hotel_Id = req.params.hotelId
            const owner_Id = req.user._id
            const hotel = await hotelModel.findOne({ _id: hotel_Id, owner: owner_Id })

            if (!hotel) {
                return res.status(404).json({ status: 404, success: false, message: "Hotel Not Fount" })
            }

            await hotelModel.deleteOne({ _id: hotel_Id });

            return res.status(200).json({ status: 200, success: true, message: "Hotel deleted successfully" })
        } catch (error) {
            console.error("Error in deleting the hotel", error)
            return res.status(500).json({ statu: 500, success: false, message: "Internal Server Error" })
        }
    },

    getAllHotelsOfOwner: async (req, res) => {
        try {
            const owner_Id = req.user._id
            console.log("owner id:- ", owner_Id)
            const allHotel = await hotelModel.find({ owner: owner_Id })
            console.log("available hotel", allHotel)
            if (!allHotel) {
                return res.status(404).json({ status: 404, success: false, message: "No hotel found for this username" })
            }

            return res.status(200).json({ status: 200, success: true, message: "Hotel fetched successfully", response: allHotel })
        } catch (error) {
            console.error("Error in fetching the hotel ", error)
            return res.status(500).json({ status: 500, success: false, message: "Internal server error" })
        }
    },

    getAllHotel: async (req, res) => {
        try {
            const response = await hotelModel.find()

            if (!response) {
                console.log("hotel response:", response)
                return res.status(404).json({ status: 404, success: false, message: "No hotel exists" })
            }

            return res.status(200).json({ status: 200, success: true, message: "All hotel fetch successfully", response: response })

        } catch (error) {
            console.error("Error in making the get request for hotel", error)
            return res.status(500).json({ status: 500, success: false, message: "Internal server error" })
        }
    },

    searchHotelByLocation: async (req, res) => {
        try {
            const searchQuery = {}

            if (req.body.country) searchQuery.country = req.body.country
            if (req.body.state) searchQuery.state = req.body.state
            if (req.body.city) searchQuery.city = req.body.city
            if (req.body.status) searchQuery.status = req.body.status

            const response = await hotelModel.find(searchQuery)

            if (!response) {
                return res.status(404).json({ status: 404, success: false, message: "hotel not found in this location" })
            }
            if (response.length === 0) {
                return res.status(200).json({ status: 404, success: false, message: "Their is no room available" })
            }
            return res.status(200).json({ status: 200, success: true, message: "hotel found successfully", response: response })
        } catch (error) {
            console.error(error)
            return res.status(500).json({ status: 500, success: false, message: "Internal Server Error" })
        }
    }
}