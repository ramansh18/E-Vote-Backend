const express = require("express");
const router = express.Router();
const { upload } = require("../middleware/upload");
const { uploadOnCloudinary } = require("../utils/cloudinary");

router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const localPath = req.file?.path;
    console.log("Received File:", req.file);

    if (!localPath) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const result = await uploadOnCloudinary(localPath);

    if (!result) {
      return res.status(500).json({ error: "Cloudinary upload failed" });
    }

    res.status(200).json({ url: result.secure_url });
  } catch (err) {
    console.error("Upload Error:", err);
    res.status(500).json({ error: "File upload failed" });
  }
});

module.exports = router;
