const dateFormate = require("../../common/date")
const roomModel = require("../../room/model/roomModel")
const bookingRoomModel = require("../model/bookingRoomModel")
const hotelModel = require("../../hotelOwner/model/hotelModel")
const moment = require("moment")
const mongoose = require("mongoose")
const Stripe = require("stripe");
const stripe = Stripe(process.env.STRIPE_SECRET_KEY); // Replace with your Stripe secret key

module.exports = {
    bookingRoom: async (req, res) => {
        try {

            const formatDate = (date) => {
                const d = new Date(date);
                const day = String(d.getDate()).padStart(2, '0');
                const month = String(d.getMonth() + 1).padStart(2, '0');  // Months are 0-indexed
                const year = d.getFullYear();
                return `${year}-${month}-${day}`;
            };
            const getNextAvailableDate = (date, daysToAdd = 1) => {
                const d = new Date(date);
                d.setDate(d.getDate() + daysToAdd); // Add the number of days to the current date  
                return formatDate(d); // Return the formatted date  
            };
            console.log("booking data ", req.body)
            const formattedCheckinDate = formatDate(req.body.checkinDate);
            const formattedCheckoutDate = formatDate(req.body.checkoutDate);

            const today = new Date()
            const formattedBookingDate = today.toISOString().split('T')[0];
            const nextAvailableDate = getNextAvailableDate(req.body.checkoutDate);

            console.log("nextAvailableDate", nextAvailableDate)

            console.log("booking room", req.user._id)
            const newBooking = new bookingRoomModel({
                accountOwnerId: req.user._id,
                hotelId: req.body.hotelId,
                roomId: new mongoose.Types.ObjectId(req.body.roomId),
                checkinDate: formattedCheckinDate,
                checkoutDate: formattedCheckoutDate,
                checkinTime: req.body.checkinTime,
                checkoutTime: req.body.checkoutTime,
                numberOfGuests: req.body.numberOfGuests,
                bookingName: req.body.bookingName,
                bookingEmail: req.body.bookingEmail,
                bookingContact: req.body.bookingContact,
                amount: req.body.amount,
                paymentStatus: req.body.paymentStatus,
                bookingDate: formattedBookingDate,
            })


            await newBooking.save()

            const updatedRoom = await roomModel.findOneAndUpdate(
                { _id: new mongoose.Types.ObjectId(req.body.roomId) },  // Query to match the room
                {
                    $set: {
                        roomOwner_Id: req.user,
                        availabilityDates: nextAvailableDate,
                        isBooked: true  // Update isBooked field to true
                    }
                },
                { new: true }  // Optionally, return the updated document
            );

            res.status(201).json({
                status: 201,
                success: true,
                message: 'Room booked successfully'
            })
        } catch (error) {
            console.error(error)
            return res.status(500).json({ status: 500, success: false, message: "Internal Server Error" })
        }
    },

    bookingRooms: async (req, res) => {
        try {
            const formatDate = (date) => {
                const d = new Date(date);
                const day = String(d.getDate()).padStart(2, '0');
                const month = String(d.getMonth() + 1).padStart(2, '0');  // Months are 0-indexed
                const year = d.getFullYear();
                return `${year}-${month}-${day}`;
            };
            const formattedCheckinDate = formatDate(req.body.checkinDate);
            const formattedCheckoutDate = formatDate(req.body.checkoutDate);

            const session = await stripe.checkout.sessions.create({
              payment_method_types: ["card"],
              mode: "payment",
              line_items: [
                {
                  price_data: {
                    currency: "usd",
                    product_data: {
                      name: "Hotel Booking",
                      description: `Booking from ${formattedCheckinDate} to ${formattedCheckoutDate}`,
                    },
                    unit_amount: req.body.amount * 100, // Convert to cents
                  },
                  quantity: 1,
                },
              ],
              customer_email: req.body.email,
              success_url: "https://heavenstay-plum.vercel.app/success?session_id={CHECKOUT_SESSION_ID}",
              cancel_url: "https://heavenstay-plum.vercel.app/cancel",
            });
        
            res.json({ url: session.url, bookingData: req.body });
          } catch (error) {
            console.error("Error creating Stripe session:", error);
            res.status(500).json({ error: "Failed to create Stripe session" });
          }
    },

    finalizeBooking: async (req, res) => {
        const { sessionId, bookingData } = req.body;
      console.log("req.body: ", req.body);
      console.log("sessionId: ", sessionId);
      console.log("bookingData: ", bookingData);
       const formatDate = (date) => {
                const d = new Date(date);
                const day = String(d.getDate()).padStart(2, '0');
                const month = String(d.getMonth() + 1).padStart(2, '0');  // Months are 0-indexed
                const year = d.getFullYear();
                return `${year}-${month}-${day}`;
            };
            const formattedCheckinDate = formatDate(bookingData.checkinDate);
            const formattedCheckoutDate = formatDate(bookingData.checkoutDate);
            const today = new Date()
            const formattedBookingDate = today.toISOString().split('T')[0];
            
        try {
          const session = await stripe.checkout.sessions.retrieve(sessionId);
      
          if (session.payment_status === "paid") {
            const booking = new bookingRoomModel({
              accountOwnerId: req.user._id,
                hotelId: bookingData.hotelId,
                roomId: new mongoose.Types.ObjectId(bookingData.roomId),
                checkinDate: formattedCheckinDate,
                checkoutDate: formattedCheckoutDate,
                checkinTime: bookingData.checkinTime,
                checkoutTime: bookingData.checkoutTime,
                numberOfGuests: bookingData.numberOfGuests,
                bookingName: bookingData.bookingName,
                bookingEmail: bookingData.bookingEmail,
                bookingContact: bookingData.bookingContact,
                amount: bookingData.amount,
                paymentStatus: "paid",
                bookingDate: formattedBookingDate, // Convert from cents
            });
      
            await booking.save();
            res.json({ success: true, message: "Booking saved successfully!" });
          } else {
            res.status(400).json({ success: false, message: "Payment not completed" });
          }
        } catch (error) {
          console.error("Error finalizing booking:", error);
          res.status(500).json({ error: "Failed to finalize booking" });
        }
      },
      


    fetchAllBookingByCustomerId: async (req, res) => {
        try {
            const customerId = req.user._id
            console.log("customerId", customerId)
            const responseById = await bookingRoomModel.aggregate(
                [
                    {
                        $match: { accountOwnerId: customerId }
                    },
                    {
                        $lookup: {
                            from: 'hotelowners',
                            localField: 'hotelId',
                            foreignField: '_id',
                            as: 'hotelDetails'
                        }
                    },
                    { $unwind: '$hotelDetails' },
                    {
                        $lookup: {
                            from: 'rooms', // Name of the rooms collection
                            localField: 'roomId', // Field in bookingRoomModel that references the room
                            foreignField: '_id', // Field in rooms collection that matches
                            as: 'roomDetails' // Alias for room details
                        }
                    },
                    {
                        $unwind: '$roomDetails' // Flatten the roomDetails array
                    },
                    {
                        $project: {
                            _id: 1,
                            accountOwnerId: 1,
                            checkinDate: 1,
                            checkoutDate: 1,
                            bookingDate: 1,
                            status: 1,
                            bookingName: 1,
                            bookingContact: 1,
                            bookingEmail: 1,
                            'hotelDetails.hotelName': 1, // Get hotel name
                            'hotelDetails.hotelAddress': 1,
                            'hotelDetails.city': 1,
                            'hotelDetails.bookingContact': 1,
                            'hotelDetails.hotelDescription': 1,
                            'hotelDetails.keyPoints': 1,
                            'roomDetails.roomNumber': 1,   // Get room details
                            'roomDetails.roomImages': 1,
                            'roomDetails.keyPoints': 1,
                            'roomDetails.floorNumber': 1,
                            'roomDetails.numberOfBed': 1,
                            'roomDetails.price': 1,
                            'roomDetails.capacity': 1,
                            'roomDetails.bathRoom': 1,
                            'roomDetails.description': 1,
                        }
                    }
                ]
            )

            console.log("response ", responseById)
            return res.status(200).json({ status: 200, success: true, message: "fetched successfully", response: responseById })

        } catch (error) {
            console.error(error)
            return res.status(500).json({ status: 500, success: false, message: "Internal Server Error" })
        }
    },

    updateByBookingId: async (req, res) => {
        try {
            const currentDate = dateFormate(Date())

            const booking_Id = req.params.bookingId
            console.log("booking_Id", booking_Id)

            let checkinDate = moment(req.body.checkinDate, "DD-MM-YYYY")
            let checkoutDate = moment(req.body.checkoutDate, "DD-MM-YYYY")
            const nextAvailabilityDate = moment(checkoutDate).add(1, 'days').format("DD-MM-YYYY")

            if (!checkinDate.isValid() || !checkoutDate.isValid()) {
                return res.status(400).json({
                    status: 400,
                    success: false,
                    message: "Invalid date format. Please use 'DD-MM-YYYY' format."
                });
            }
            checkinDate = checkinDate.format("DD-MM-YYYY")
            checkoutDate = checkoutDate.format("DD-MM-YYYY")

            const updateBooking = {
                checkinDate: checkinDate,
                checkoutDate: checkoutDate,
                numberOfGuests: req.body.numberOfGuests,
                nextAvailability: nextAvailabilityDate,
                bookingDate: currentDate,
                status: req.body.status,
            }
            const response = await bookingRoomModel.findByIdAndUpdate(booking_Id, updateBooking, {
                new: true,
                runValidators: true
            })
            if (!response) {
                return res.status(404).json({ status: 404, message: "Booking with this credentials not found" })
            }
            return res.status(200).json({ status: 200, success: true, message: "Booking updated successfully" })
        } catch (error) {
            console.error(error)
            return res.status(500).json({ status: 500, success: false, message: "Internal Server Error" })
        }
    },

    cancelBooking: async (req, res) => {
        try {
            const bookingId = req.params.bookingId
            const newUpdate = {
                status: 'Canceled'
            }
            const updateBooking = await bookingRoomModel.findByIdAndUpdate(bookingId, newUpdate, {
                new: true,
                runValidators: true
            })

            if (!updateBooking) {
                return res.status(404).json({ status: 400, success: false, message: "Booking not found" })
            }
            return res.status(200).json({ status: 200, success: false, message: "Booking canceled successfully" })

        } catch (error) {
            console.error(error)
            return res.status(500).json({ status: 500, success: false, message: "Internal Server Error" })
        }
    },

    searchRooms: async (req, res) => {

        try {
            const { location, checkIn, checkOut } = req.params;
            console.log("dates:- ", location, checkIn, checkOut);
            const checkInDate = new Date(checkIn);
            const checkOutDate = new Date(checkOut);
            console.log("dates:- ", checkInDate, checkOutDate, location)

            const rooms = await hotelModel.aggregate([

                {
                    $match: {
                        city: location
                    }
                },
                {
                    $lookup: {
                        from: "rooms", // The collection to join
                        localField: "_id", // Field from hotelOwners
                        foreignField: "roomHotel_Id", // Field in rooms
                        as: "rooms" // The output array field
                    }
                },
                {
                    $match: {
                        "rooms": { $ne: [] } // Ensure rooms are present
                    }
                },
                // Step 4: Project the desired fields from both hotel and rooms
                {
                    $project: {
                        hotelName: 1,
                        hotelDescription: 1,
                        hotelAddress: 1,
                        keyPoints: 1,
                        _id: 1,
                        images: 1,
                        rooms: {
                            roomNumber: 1,
                            floorNumber: 1,
                            price: 1,
                            capacity: 1,
                            description: 1,
                            bathRoom: 1,
                            roomImages: 1,
                            keyPoints: 1,
                            _id: 1,
                            roomImages: 1,
                        }
                    }
                }
            ])

            console.log("booking rooms:- ", rooms)

            if (rooms.length === 0) {
                return res
                    .status(404)
                    .json({ message: "No rooms available for the specified criteria." });
            }

            return res.status(200).json({ status: 200, success: true, message: "fetched successfully", response: rooms });

        } catch (error) {
            console.log("error in searching rooms", error)
            return error
        }
    }
}


// $or: [
//     // Case 1: availabilityDate matches the range
//     {
//         availabilityDate: {
//             $all: [
//                 { $elemMatch: { $gte: checkInDate, $lte: checkOutDate } },
//             ],
//         },
//     },
//     // Case 2: availabilityDate is not present (or null/undefined)
//     {
//         $or: [
//             { availabilityDate: { $exists: false } }, // Field does not exist
//             { availabilityDate: null },              // Field is null
//             { availabilityDate: { $size: 0 } },      // Field is an empty array
//         ],
//     },
// ],