const path = require('path');
const fs = require('fs');
const multer = require('multer');

// Vercel's filesystem is read-only and wiped between invocations, so uploads
// there must go to Cloudinary. Locally (no Cloudinary keys) we keep writing to
// backend/uploads and serving it via express.static in server.js.
const useCloudinary = Boolean(
    process.env.CLOUDINARY_URL ||
    (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET)
);

let storage;

if (useCloudinary) {
    const cloudinary = require('cloudinary').v2;
    const { CloudinaryStorage } = require('multer-storage-cloudinary');

    if (!process.env.CLOUDINARY_URL) {
        cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET,
        });
    }

    storage = new CloudinaryStorage({
        cloudinary,
        params: async (req, file) => {
            // PDFs go up as "raw": Cloudinary blocks PDF delivery from the image pipeline by default.
            const isPdf = file.mimetype === 'application/pdf';
            return {
                folder: process.env.CLOUDINARY_FOLDER || 'webcard',
                resource_type: isPdf ? 'raw' : 'auto',
                public_id: `${file.fieldname}-${Date.now()}-${Math.round(Math.random() * 1E9)}${isPdf ? '.pdf' : ''}`,
            };
        },
    });
} else {
    if (process.env.VERCEL) {
        console.error('Cloudinary is not configured: file uploads will fail on Vercel. Set CLOUDINARY_URL.');
    }

    const uploadDir = path.join(__dirname, '../uploads');
    try {
        if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    } catch (err) {
        console.error('Could not create uploads directory:', err.message);
    }

    storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, uploadDir);
        },
        filename: function (req, file, cb) {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            const ext = path.extname(file.originalname);
            cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
        }
    });
}

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 },
    // The "file" field (portfolio attachments) only takes PDFs; reject others before they are stored.
    fileFilter: (req, file, cb) => {
        if (file.fieldname === 'file' && file.mimetype !== 'application/pdf') {
            const err = new Error('Only PDF files can be attached.');
            err.status = 400;
            return cb(err);
        }
        cb(null, true);
    },
});

// Cloudinary gives a full https URL in file.path; disk uploads are served from /uploads.
const fileUrl = (file) => (useCloudinary ? file.path : `/uploads/${file.filename}`);

module.exports = { upload, fileUrl, useCloudinary };
