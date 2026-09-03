# CoffeeCODEHub — Fixed Production Structure

```text
CoffeeCODEHub/
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   ├── vite.config.js
│   ├── .env.example
│   └── ...
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── server.js
│   ├── package.json
│   └── .env.example
└── README.md
```

## Important fixes

- Fixed the invalid `FaSnapchatGhost` import in both `SocialLinks.jsx` and `Admin.jsx`.
- Added one canonical media URL resolver so old `/uploads/...` and `localhost:5000/uploads/...` records resolve against the configured API server.
- Added cache prevention for API GET requests/settings so stale navbar/footer data is not restored from browser cache.
- Kept Navbar/Footer mounted only once from `App.jsx`; admin routes intentionally do not render the public shell.
- Production uploads no longer silently use Render's ephemeral local disk. Cloudinary must be configured for persistent production images.
- Added safer upload type/size handling, stricter admin login rate limiting, JWT issuer/audience validation, required production secrets, safer CORS, and API error handling.
- Removed the backend `.env` file from the deliverable. Configure deployment secrets from the hosting provider instead.
- Seed image paths were updated for the new `frontend/src/assets` location.

## Local development

### Frontend
```bash
cd frontend
npm install
npm run dev
```

Create `frontend/.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

### Backend
```bash
cd backend
npm install
npm start
```

Create `backend/.env` from `.env.example`.

For local image uploads without Cloudinary:
```env
ALLOW_LOCAL_UPLOADS=true
```

For production, configure Cloudinary:
```env
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
ALLOW_LOCAL_UPLOADS=false
```

Also configure:
- `MONGO_URI`
- `JWT_SECRET` (32+ characters)
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD` (12+ characters)
- `CLIENT_URL` (your frontend origin)
- `SITE_URL` (your public website URL)
- SMTP variables if email notifications are required

## Deployment order

1. Deploy `backend/` as the Render Web Service.
2. Add backend environment variables in Render.
3. Configure Cloudinary before using the Admin image uploader.
4. Deploy `frontend/` as the static site.
5. Set `VITE_API_URL` to the deployed backend `/api` URL before building.
6. Set backend `CLIENT_URL` to the exact frontend origin.


## Final QA / Deployment Notes

- Frontend is isolated under `frontend/`; backend is isolated under `backend/`.
- The public app waits for global site settings before mounting the public shell, preventing the default-content/API-content flash that made the page look like two different websites on refresh.
- Public list pages no longer render fallback records first and then replace them with API records. Fallback data is used only when the API fails or returns no records.
- React development `StrictMode` was removed from the entry point to avoid duplicate development effect runs and confusing duplicate API requests.
- Legacy media URLs such as `/uploads/...` and `http://localhost:5000/uploads/...` are normalized against the configured API origin.
- Production uploads require Cloudinary because Render/local ephemeral storage must not be relied upon for permanent media.
- Set `VITE_API_URL` in the frontend build environment to the deployed backend API URL, for example `https://your-backend.onrender.com/api`.
- Set `CLIENT_URL` in the backend to the exact deployed frontend origin (without a trailing slash).
- Never commit `.env` files or production secrets.


## Final UI stability fixes

- Replaced the unavailable Feather `FiGripVertical` import with the supported `FaGripVertical` icon; no visual layout change.
- Added an internal scroll area to the desktop Admin CMS navigation so all sections remain accessible on shorter screens.
- The public Home route now keeps a full-page loading surface while its API data is loading, preventing the Footer from jumping to the top while the main content is temporarily empty.
- Media URL normalization now also repairs legacy `/api/uploads/...` values and supports storage-provider URL objects.
