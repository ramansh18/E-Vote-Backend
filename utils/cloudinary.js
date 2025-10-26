const cloudinary = require("cloudinary").v2;
const fs = require("fs");
const path = require("path"); // to extract filename

cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET 
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;

    // Extract filename without extension
    const filename = path.basename(localFilePath, path.extname(localFilePath));

    // Upload the file to cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
      folder: "e-voting-uploads",
      public_id: filename, // Now defined!
    });

    console.log("file is uploaded on cloudinary:", response.secure_url);

    fs.unlinkSync(localFilePath); // Clean up temp file

    return response;

  } catch (error) {
    console.error("Cloudinary Upload Error:", error);
    fs.existsSync(localFilePath) && fs.unlinkSync(localFilePath); // Safer cleanup
    return null;
  }
};

module.exports = { uploadOnCloudinary };
