# Deploying ZaleN-Gam to Vercel

## Prerequisites

1. [Vercel account](https://vercel.com/signup)
2. [GitHub/GitLab/Bitbucket account](https://github.com) (for repo import)
3. External services set up:
   - MongoDB Atlas cluster
   - Firebase project
   - Cloudinary account
   - reCAPTCHA v3 keys

---

## Step 1: Prepare Your Environment Variables

Before deploying, gather all these values:

### MongoDB Atlas
1. Create cluster at [mongodb.com](https://mongodb.com)
2. Database Access → Create user
3. Network Access → Allow all IPs (`0.0.0.0/0`)
4. Connect → Drivers → Node.js → Copy connection string
5. Replace `<password>` with your user's password

### Firebase
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create project → Enable Authentication (Email/Password + Google)
3. Project Settings → General → Web API Key, Auth Domain, Project ID
4. Project Settings → Service Accounts → Generate new private key
5. Download JSON → paste entire content into `FIREBASE_ADMIN_SDK_JSON`

### Cloudinary
1. Sign up at [cloudinary.com](https://cloudinary.com)
2. Dashboard → Cloud Name, API Key, API Secret

### reCAPTCHA v3
1. Go to [Google reCAPTCHA](https://www.google.com/recaptcha/admin)
2. Create → reCAPTCHA v3 → Add your Vercel domain
3. Copy Site Key (public) and Secret Key (private)

### Session Secret
Generate a random 32+ character string:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## Step 2: Deploy to Vercel

### Option A: Git Push (Recommended)

```bash
# Initialize git
git init
git add .
git commit -m "Initial commit"

# Create repo on GitHub, then push
git remote add origin https://github.com/YOUR_USERNAME/zalen-gam.git
git branch -M main
git push -u origin main
```

Then on Vercel:
1. Import Git Repository
2. Select `zalen-gam`
3. Framework Preset: Next.js
4. Add all Environment Variables (see list below)
5. Deploy

### Option B: Vercel CLI

```bash
npm i -g vercel
vercel login
vercel
```

Follow prompts, add env vars when asked.

---

## Step 3: Add Environment Variables in Vercel Dashboard

Go to Project → Settings → Environment Variables, add ALL of these:

| Variable | Value | Environment |
|----------|-------|-------------|
| `MONGODB_URI` | your_mongodb_connection_string | Production, Preview, Development |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | your_firebase_api_key | Production, Preview, Development |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | your-project.firebaseapp.com | Production, Preview, Development |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | your-project-id | Production, Preview, Development |
| `FIREBASE_ADMIN_SDK_JSON` | {entire json content} | Production, Preview, Development |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | your_cloud_name | Production, Preview, Development |
| `CLOUDINARY_API_KEY` | your_api_key | Production, Preview, Development |
| `CLOUDINARY_API_SECRET` | your_api_secret | Production, Preview, Development |
| `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` | your_site_key | Production, Preview, Development |
| `RECAPTCHA_SECRET_KEY` | your_secret_key | Production, Preview, Development |
| `SESSION_SECRET` | random_32_char_string | Production, Preview, Development |
| `SUPER_ADMIN_NAME` | Admin | Production, Preview, Development |
| `SUPER_ADMIN_EMAIL` | admin@yourdomain.com | Production, Preview, Development |
| `SUPER_ADMIN_PASSWORD` | strong_password | Production, Preview, Development |
| `UPSTASH_REDIS_REST_URL` | (optional) | Production |
| `UPSTASH_REDIS_REST_TOKEN` | (optional) | Production |

> **IMPORTANT:** `NEXT_PUBLIC_*` variables are exposed to the browser. Only put public keys there.

---

## Step 4: Seed the Database

After first deploy, seed your production database:

```bash
# Local seed (pointing to production DB)
MONGODB_URI="your_prod_uri" npm run seed
```

Or use MongoDB Compass to manually insert the seed data.

---

## Step 5: Configure Firebase Auth Authorized Domains

1. Firebase Console → Authentication → Settings → Authorized domains
2. Add your Vercel domain: `zalen-gam.vercel.app`
3. Add custom domain if you have one

---

## Step 6: Configure reCAPTCHA Domains

1. Google reCAPTCHA Admin → Your site
2. Add your Vercel domain to allowed domains
3. Save

---

## Step 7: Verify Deployment

| Check | URL |
|-------|-----|
| Homepage | `https://your-domain.vercel.app/` |
| Article | `https://your-domain.vercel.app/news/global-markets-rally-inflation-data-improvement` |
| Category | `https://your-domain.vercel.app/category/technology` |
| Staff Login | `https://your-domain.vercel.app/control-room-code-007` |
| Reader Login | `https://your-domain.vercel.app/login` |

---

## Post-Deploy: First Login

Use the seeded credentials to log into the staff portal:

| Role | Username | Password |
|------|----------|----------|
| SUPER_ADMIN | (your env value) | (your env value) |
| ADMIN | Demo Admin | admin123456 |
| EDITOR | Demo Editor | editor123456 |
| AUTHOR | Demo Author | author123456 |

---

## Troubleshooting

### Build fails with "Cannot find module"
```bash
# Delete lockfile and reinstall
rm package-lock.json
npm install
```

### MongoDB connection timeout
- Check IP whitelist in MongoDB Atlas (must include `0.0.0.0/0`)
- Verify connection string format

### Firebase auth fails
- Verify `FIREBASE_ADMIN_SDK_JSON` is valid JSON (no newlines)
- Check authorized domains in Firebase Console

### Session not persisting
- Ensure `SESSION_SECRET` is at least 32 characters
- Check cookie settings in production (secure flag)

### Images not loading
- Verify Cloudinary credentials
- Check `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` is set correctly

---

## Custom Domain (Optional)

1. Vercel Dashboard → Domains
2. Add your domain
3. Update DNS records as instructed
4. Update Firebase Auth authorized domains
5. Update reCAPTCHA allowed domains
