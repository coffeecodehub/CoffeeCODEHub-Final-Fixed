const { uploadBuffer } = require('../services/mediaService');

exports.upload = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'Please choose an image.' });
    const folder = String(req.body.folder || 'coffeecodehub').replace(/[^a-zA-Z0-9/_-]/g, '').slice(0, 120) || 'coffeecodehub';
    const result = await uploadBuffer(req.file, folder);
    return res.status(201).json({
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
      format: 'webp'
    });
  } catch (e) {
    console.error('Media upload error:', e);
    const message = /Input buffer contains unsupported image format|heic|heif|image/i.test(e.message || '')
      ? `This image could not be decoded by the server. Please use JPG, PNG, WebP, GIF, AVIF or SVG. (${e.message})`
      : (e.message || 'Image upload failed');
    return res.status(400).json({ success: false, message });
  }
};
