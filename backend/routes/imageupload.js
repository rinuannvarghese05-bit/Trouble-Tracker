import express from "express";
import multer from "multer";
import imagekit from "../utils/imagekit.js"; // your configured ImageKit SDK

const upload = multer();

const router = express.Router();

router.post("/upload-images", upload.array("images", 5), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0)
      return res.status(400).json({ message: "No images uploaded." });

    const uploadedImageUrls = [];

    for (const file of req.files) {
      const result = await imagekit.upload({
        file: file.buffer.toString("base64"),
        fileName: `${Date.now()}-${file.originalname}`,
        folder: "/complaints",
      });
      uploadedImageUrls.push(result.url);
    }

    res.status(200).json({
      filePaths: uploadedImageUrls // must be filePaths!
    });
  } catch (err) {
    console.error("Image upload failed:", err);
    res.status(500).json({ error: "Failed to upload images" });
  }
});

export default router;
