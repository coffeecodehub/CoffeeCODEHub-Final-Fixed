const multer = require('multer');

const storage = multer.memoryStorage();

// Accept image/* here and let the media service decode/convert the actual
// bytes with Sharp. This supports modern browser formats without trusting
// a file extension alone. The decoded image is always normalized before it
// is stored.
module.exports = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024, files: 10, fields: 20 },
  fileFilter: (req, file, cb) => {
    const mime = String(file.mimetype || '').toLowerCase();
    if (mime.startsWith('image/')) return cb(null, true);
    return cb(new Error('Please choose an image file. Supported formats are converted automatically to WebP.'));
  }
});
