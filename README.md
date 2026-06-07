# ZaleN-Gam News Platform

A complete, production-ready news website built with Next.js 14, TypeScript, MongoDB, Firebase, and Cloudinary.

## Features

### Public Features
- **Homepage** with featured articles, latest news, trending stories, and categories
- **Article pages** with rich content, related articles, and comments
- **Category archives** with pagination
- **Search functionality**
- **Reader authentication** via Firebase (email/password or Google)
- **Reader dashboard** with saved articles, followed categories, and notifications
- **Comment system** with admin moderation
- **Newsletter subscription**
- **Contact form**
- **Dark/Light mode toggle**
- **Responsive design**

### Staff Dashboard (Control Room)
- **Role-based access control** with 4 staff roles:
  - **SUPER_ADMIN**: Full system access, user management, settings, logs
  - **ADMIN**: Manage all articles, categories, and comments
  - **EDITOR**: Create/edit/publish own articles, approve AUTHOR submissions
  - **AUTHOR**: Create/edit own drafts, submit for review (cannot publish)
- **Secret URL**: `/control-room-code-007` (hardcoded, not discoverable)
- **Password change enforcement** for new accounts
- **System logging** for all staff actions

### Security
- **No SQL injection** via Mongoose parameterized queries
- **reCAPTCHA v3** on all public forms
- **Rate limiting** per IP (configurable via Redis or memory fallback)
- **Honeypot + time trap** spam detection
- **Comment moderation** (all comments pending approval by default)
- **Input sanitization** via DOMPurify
- **Iron-session** for secure staff sessions

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, TailwindCSS, shadcn/ui
- **Backend**: Next.js API Routes
- **Database**: MongoDB (articles, staff, categories, settings, logs)
- **Authentication**: Firebase Auth (readers), custom session (staff)
- **Real-time**: Firestore (reader profiles, comments, notifications)
- **Images**: Cloudinary
- **Security**: reCAPTCHA v3, rate limiting, input sanitization

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB database
- Firebase project
- Cloudinary account
- reCAPTCHA v3 keys

### Installation

1. **Clone and install dependencies**:
```bash
cd zalen-gam
npm install
```

2. **Set up environment variables**:
Copy `.env.example` to `.env.local` and fill in all required values:
```bash
cp .env.example .env.local
```

3. **Run the seed script** to create initial data:
```bash
npm run seed
```

This creates:
- 1 SUPER_ADMIN (from env vars)
- 1 ADMIN, 1 EDITOR, 1 AUTHOR (demo accounts)
- 5 categories
- 3 site settings
- 5 sample published articles

4. **Start the development server**:
```bash
npm run dev
```

5. **Open the app**:
- Public site: http://localhost:3000
- Staff dashboard: http://localhost:3000/control-room-code-007

### Demo Credentials (after seeding)

| Role | Username | Password |
|------|----------|----------|
| SUPER_ADMIN | (from env) | (from env) |
| ADMIN | Demo Admin | admin123456 |
| EDITOR | Demo Editor | editor123456 |
| AUTHOR | Demo Author | author123456 |

## URL Structure

| URL | Description |
|-----|-------------|
| `/` | Homepage |
| `/news/[slug]` | Article detail |
| `/category/[slug]` | Category archive |
| `/search` | Search results |
| `/about` | About page |
| `/contact` | Contact form |
| `/login` | Reader login |
| `/register` | Reader registration |
| `/dashboard` | Reader dashboard |
| `/control-room-code-007` | Staff portal (login + dashboard) |

## API Routes

### Public APIs
- `POST /api/comments` - Submit comment
- `POST /api/newsletter` - Subscribe to newsletter
- `POST /api/contact` - Submit contact form
- `POST /api/reader/register` - Register reader
- `POST /api/reader/saved` - Save/unsave article
- `POST /api/reader/follow-category` - Follow/unfollow category

### Staff APIs
- `POST /api/staff/login` - Staff login
- `POST /api/staff/logout` - Staff logout
- `POST /api/staff/change-password` - Change password
- `GET/POST /api/staff/articles` - List/Create articles
- `GET/PUT/DELETE /api/staff/articles/[id]` - Article CRUD
- `GET/POST /api/staff/users` - List/Create staff users
- `GET/POST /api/staff/categories` - List/Create categories
- `GET/PUT /api/staff/comments` - Moderate comments
- `GET/PUT /api/staff/settings` - Site settings
- `GET /api/staff/logs` - System logs
- `POST /api/staff/upload-image` - Upload images

## Environment Variables

### Required
- `MONGODB_URI` - MongoDB connection string
- `NEXT_PUBLIC_FIREBASE_API_KEY` - Firebase API key
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` - Firebase auth domain
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID` - Firebase project ID
- `FIREBASE_ADMIN_SDK_JSON` - Firebase Admin SDK JSON
- `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` - Cloudinary cloud name
- `CLOUDINARY_API_KEY` - Cloudinary API key
- `CLOUDINARY_API_SECRET` - Cloudinary API secret
- `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` - reCAPTCHA site key
- `RECAPTCHA_SECRET_KEY` - reCAPTCHA secret key
- `SESSION_SECRET` - Iron session secret (min 32 chars)
- `SUPER_ADMIN_NAME` - Super admin name for seeding
- `SUPER_ADMIN_EMAIL` - Super admin email for seeding
- `SUPER_ADMIN_PASSWORD` - Super admin password for seeding

### Optional
- `UPSTASH_REDIS_REST_URL` - Redis URL for rate limiting
- `UPSTASH_REDIS_REST_TOKEN` - Redis token for rate limiting

## Deployment

### Vercel (Recommended)
1. Push to GitHub
2. Connect to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Self-hosted
```bash
npm run build
npm start
```

## License

MIT License
