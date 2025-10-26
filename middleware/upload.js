const multer = require("multer");
const path = require("path");

// Helper to sanitize filename (remove spaces and special chars)
const sanitizeFileName = (name) => {
  return name.replace(/\s+/g, "_").replace(/[^a-zA-Z0-9_\-\.]/g, "");
};

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/temp");
  },
  filename: function (req, file, cb) {
    const timestamp = Date.now();
    const originalName = path.parse(file.originalname).name;
    const extension = path.extname(file.originalname);
    const cleanName = sanitizeFileName(originalName);

    // Final filename: cleanName + timestamp + extension
    const filename = `${cleanName}_${timestamp}${extension}`;
    console.log(filename)
    cb(null, filename);
  },
});

const upload = multer({
  storage,
});

module.exports = { upload };
