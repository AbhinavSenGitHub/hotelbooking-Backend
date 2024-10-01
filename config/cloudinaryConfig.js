const cloudinary = require('cloudinary').v2;
const multer = require('multer');

// Configure Cloudinary with credentials from environment variables

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_SECRET,
});
// Configure Multer for file uploads (in-memory storage)
const storage = multer.memoryStorage();
const upload = multer({ storage });

const uploadImageToCloudinary = (fileBuffer) => {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream((error, result) => {
        if (error) {
          reject(error); // Reject the promise if an error occurs
        } else {
          resolve(result.secure_url); // Resolve the promise with the image URL
        }
      });
  
      uploadStream.end(fileBuffer); // Write the buffer to the stream
    });
  };

// Export Cloudinary and Multer configurations
module.exports = { cloudinary, upload, uploadImageToCloudinary};
