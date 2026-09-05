const { v2: cloudinary } = require('cloudinary');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const sharp = require('sharp');

const hasCloudinary = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

if (hasCloudinary) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
}

async function normalizeImage(file) {
  if (!file?.buffer?.length) throw new Error('Image file is empty.');

  // Decode the real image, auto-rotate using EXIF, cap huge dimensions and
  // normalize every accepted input to a web-friendly WebP. This removes the
  // need for admins to manually convert PNG/JPEG/AVIF/GIF/SVG/etc.
  const buffer = await sharp(file.buffer, { failOn: 'error', limitInputPixels: 40_000_000 })
    .rotate()
    .resize({ width: 2400, height: 2400, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 88, effort: 4 })
    .toBuffer();

  return { buffer, contentType: 'image/webp' };
}

function cloudinaryUpload(buffer, folder) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'image', format: 'webp', use_filename: false },
      (err, result) => (err ? reject(err) : resolve(result))
    );
    stream.end(buffer);
  });
}

async function uploadBuffer(file, folder = 'coffeecodehub') {
  const normalized = await normalizeImage(file);

  if (hasCloudinary) {
    return cloudinaryUpload(normalized.buffer, folder);
  }

  // Local storage is deliberately enabled by default for development so
  // localhost admin uploads work immediately. Production must use Cloudinary
  // because hosted container filesystems are ephemeral.
  const allowLocal = process.env.NODE_ENV !== 'production' && process.env.ALLOW_LOCAL_UPLOADS !== 'false';
  if (!allowLocal) {
    throw new Error('Permanent image storage is not configured. Add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET in production.');
  }

  const uploadDir = path.join(__dirname, '..', 'uploads');
  await fs.promises.mkdir(uploadDir, { recursive: true });
  const filename = `${Date.now()}-${crypto.randomBytes(8).toString('hex')}.webp`;
  const destination = path.join(uploadDir, filename);
  await fs.promises.writeFile(destination, normalized.buffer);

  const base = (process.env.API_PUBLIC_URL || process.env.RENDER_EXTERNAL_URL || `http://localhost:${process.env.PORT || 5000}`).replace(/\/$/, '');
  return { secure_url: `${base}/uploads/${filename}`, public_id: `local/${filename}` };
}

async function deleteMedia(publicId) {
  if (!publicId) return;

  if (hasCloudinary && !String(publicId).startsWith('local/')) {
    await cloudinary.uploader.destroy(publicId, { resource_type: 'image', invalidate: true });
    return;
  }

  if (String(publicId).startsWith('local/')) {
    const filename = String(publicId).slice('local/'.length);
    const filePath = path.join(__dirname, '..', 'uploads', filename);
    try { await fs.promises.unlink(filePath); } catch (e) {
      if (e.code !== 'ENOENT') throw e;
    }
  }
}

module.exports = { uploadBuffer, deleteMedia };
