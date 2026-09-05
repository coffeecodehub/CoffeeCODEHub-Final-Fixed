const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');

dotenv.config();

// Environment Validation
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

// Allowed Origins: Default Production + Localhost + CLIENT_URL from env
const defaultOrigins = [
  'https://coffecodehub.com',
  'https://www.coffecodehub.com',
  'http://localhost:3000',
  'http://localhost:5173'
];

const envOrigins = (process.env.CLIENT_URL || '')
  .split(',')
  .map((x) => x.trim())
  .filter(Boolean);

const allowedOrigins = Array.from(new Set([...defaultOrigins, ...envOrigins]));

app.disable('x-powered-by');
app.set('trust proxy', 1);

app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

app.use(cors({
  origin: (origin, callback) => {
    // Postman, server-to-server ya mobile requests allow karne ke liye !origin
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error(`Origin ${origin} not allowed by CORS`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

app.use('/api', (req, res, next) => {
  // Public GET responses can be reused briefly by the browser/CDN.
  // Admin/authenticated requests and mutations must always be fresh.
  const isPublicGet = req.method === 'GET' &&
    !req.headers.authorization &&
    !req.path.startsWith('/auth') &&
    !req.path.includes('/admin') &&
    !req.path.startsWith('/dashboard') &&
    !req.path.startsWith('/reviews');

  if (isPublicGet) {
    res.setHeader('Cache-Control', 'public, max-age=60, stale-while-revalidate=300');
  } else {
    res.setHeader('Cache-Control', 'no-store, max-age=0');
  }

  res.setHeader('Vary', 'Origin, Authorization');
  next();
});

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

// Root Route (Render Service Status / Browser Check)
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    service: 'CoffeeCODEHub API',
    status: 'running',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    time: new Date().toISOString()
  });
});

// Health Route
app.get('/api/health', (req, res) => res.json({
  success: true,
  service: 'CoffeeCODEHub API',
  database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
  time: new Date().toISOString()
}));

// Routes
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

// Sitemap Route
app.get('/sitemap.xml', async (req, res, next) => {
  try {
    const base = process.env.SITE_URL || 'https://coffecodehub.com';
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

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err);
  if (res.headersSent) return next(err);
  const status = err.name === 'MulterError' || /image|upload|origin|CORS/i.test(err.message || '') ? 400 : 500;
  res.status(status).json({
    success: false,
    message: status === 400 ? err.message : 'Internal server error'
  });
});

// Database Connection & Server Start
const PORT = Number(process.env.PORT || 5000);
mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('MongoDB connected');
    await require('./config/seed').seed();
    app.listen(PORT, () => console.log(`CoffeeCODEHub API running on ${PORT}`));
  })
  .catch((e) => {
    console.error('MongoDB connection error:', e.message);
    process.exit(1);
  });