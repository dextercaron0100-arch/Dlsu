# DLSU Portal

Responsive landing and login page for the DLSU student portal.

## Run locally

Open `index.html` in a browser or run a static web server from this directory.

> The login form uses the included Neon/Vercel backend after the database and environment variables are configured. Google sign-in is still a visual placeholder.

## Neon backend setup

The portal includes Vercel Functions under `api/` and uses Neon PostgreSQL.

1. Create a Neon project and copy its pooled connection string.
2. Open the Neon SQL Editor and run `db/schema.sql`.
3. In Vercel → Project → Settings → Environment Variables, add:
   - `DATABASE_URL` — Neon connection string
   - `AUTH_SECRET` — a random value containing at least 32 characters
   - `TURNSTILE_SECRET_KEY` — optional until Cloudflare Turnstile is enabled
4. Redeploy the Vercel project.
5. Create a student account locally after setting `DATABASE_URL`:

   `npm run create-user -- 123456789 student@example.edu.ph "Student User" "A-Strong-Password-123"`

Never commit `.env`, database credentials, real student passwords, or personal student records.

### API routes

- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `GET /api/dashboard`
- `GET /api/payments`
- `GET /api/courses`
- `GET /api/health`
