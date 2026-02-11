import express from 'express';
import multer from 'multer';
import ImageKit from 'imagekit';

const router = express.Router();
const upload = multer();

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
});

router.post('/upload', upload.array('images', 5), async (req, res) => {
  try {
    const uploadedFiles = await Promise.all(
      req.files.map(file =>
        imagekit.upload({
          file: file.buffer,
          fileName: `${Date.now()}-${file.originalname}`,
        })
      )
    );
    const imageUrls = uploadedFiles.map(file => file.url);
    res.json({ filePaths: imageUrls });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Image upload failed' });
  }
});

export default router;
