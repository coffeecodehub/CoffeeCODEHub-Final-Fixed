const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');

dotenv.config();

const requiredEnv = ['MONGO_URI', 'JWT_SECRET', 'ADMIN_EMAIL', 'ADMIN_PASSWORD'];
const missing = requiredEnv.filter((key) => !process.env[key] || process.env[key].trim().length < 1);
if (missing.length) {
  console.error(`Missing required environment variables: ${missing.join(', ')}`);
  process.exit(1);
}
if (process.env.JWT_SECRET.length < 32) {
  console.error('JWT_SECRET must be at least 32 characters long.');
  process.exit(1);
}
if (process.env.ADMIN_PASSWORD.length < 12) {
  console.error('ADMIN_PASSWORD must be at least 12 characters long.');
  process.exit(1);
}

const app = express();
const allowedOrigins = (process.env.CLIENT_URL || '')
  .split(',')
  .map((x) => x.trim())
  .filter(Boolean);

app.disable('x-powered-by');
app.set('trust proxy', 1);
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('Origin not allowed by CORS'));
  },
  credentials: false
}));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use('/api', (req, res, next) => { res.setHeader('Cache-Control', 'no-store, max-age=0'); next(); });
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  maxAge: '1d',
  immutable: true
}));
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false
}));

app.get('/api/health', (req, res) => res.json({
  success: true,
  service: 'CoffeeCODEHub API',
  database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
  time: new Date().toISOString()
}));

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/services', require('./routes/serviceRoutes'));
app.use('/api/projects', require('./routes/projectRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'));
app.use('/api/team', require('./routes/teamRoutes'));
app.use('/api/blogs', require('./routes/blogRoutes'));
app.use('/api/leads', require('./routes/leadRoutes'));
app.use('/api/media', require('./routes/mediaRoutes'));
app.use('/api/settings', require('./routes/settingsRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));

app.get('/sitemap.xml', async (req, res, next) => {
  try {
    const base = process.env.SITE_URL || 'http://localhost:5000';
    const Service = require('./models/Service');
    const Project = require('./models/Project');
    const Blog = require('./models/Blog');
    const [services, projects, blogs] = await Promise.all([
      Service.find({ isActive: true }).select('slug').lean(),
      Project.find({ isPublished: true }).select('slug').lean(),
      Blog.find({ status: 'published' }).select('slug').lean()
    ]);
    const urls = [
      '/', '/about', '/services', '/projects', '/blog', '/contact',
      ...services.map((x) => `/services/${x.slug}`),
      ...projects.map((x) => `/project/${x.slug}`),
      ...blogs.map((x) => `/blog/${x.slug}`)
    ];
    const escapeXml = (v) => String(v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    res.type('application/xml').send(
      `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls
        .map((u) => `<url><loc>${escapeXml(base + u)}</loc></url>`).join('')}</urlset>`
    );
  } catch (e) {
    next(e);
  }
});

// Multer and other request errors should return a safe, useful status.
app.use((err, req, res, next) => {
  console.error(err);
  if (res.headersSent) return next(err);
  const status = err.name === 'MulterError' || /image|upload|origin|CORS/i.test(err.message || '') ? 400 : 500;
  res.status(status).json({
    success: false,
    message: status === 400 ? err.message : 'Internal server error'
  });
});

const PORT = Number(process.env.PORT || 5000);
mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('MongoDB connected');
    await require('./config/seed').seed();
  })
  .catch((e) => {
    console.error('MongoDB connection error:', e.message);
    process.exit(1);
  });

app.listen(PORT, () => console.log(`CoffeeCODEHub API running on ${PORT}`));
