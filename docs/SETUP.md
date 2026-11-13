# Setup and Operations Guide

## Requirements

- Node.js 18 or newer
- npm
- MySQL 8
- A terminal and browser

## Database Setup

From the repository root:

```bash
mysql -u root -p < backend/database/schema.sql
mysql -u root -p Batloung_db < backend/database/seed.sql
```

The schema creates the database and tables. The seed file inserts the catalogue, box sizes, products, and sample business records.

## Backend Setup

```bash
cd backend
npm install
```

Create `backend/.env`:

```env
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=Batloung_db
JWT_SECRET=replace_with_a_long_random_secret
JWT_EXPIRES_IN=8h
NODE_ENV=development
```

Run:

```bash
npm start
```

The health endpoint is `GET http://localhost:5000/api/health`.

## Frontend Setup

```bash
cd frontend
npm install
```

Create `frontend/.env` when the API is not running on the default URL:

```env
VITE_API_URL=http://localhost:5000/api
```

Run the development server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

## Seed Users

The user seed script is `backend/scripts/seedUsers.js`. Run it after the database is available according to the credentials configured in that script.

<<<<<<< HEAD
## Deploy on Render

The repository includes a `render.yaml` Blueprint for the Node API and Vite static site. Render does not provide a managed MySQL service, so provision a reachable MySQL 8 or compatible TiDB database separately. Keep the database credentials and JWT secret in Render environment variables; never commit them.

1. Push the project to a Git provider connected to Render, then choose **New → Blueprint** in the Render Dashboard and select the repository containing `render.yaml`.
2. Provide the API service's `DB_HOST`, `DB_PORT`, `DB_USER`, and `DB_PASSWORD`. `DB_NAME` defaults to `Batloung_db`; change it only if the database's schema and application configuration use the same name. The database must accept connections from Render and support TLS.
3. Prepare the database before serving real traffic. The API has `AUTO_IMPORT=false` in Render so deployment will not run schema or seed scripts automatically. `backend/database/schema.sql` begins with `DROP DATABASE IF EXISTS Batloung_db`; only use it for a new, empty, dedicated database after verifying the target and taking any needed backup. Then apply `backend/database/seed.sql` if the catalogue and sample records are needed. Do not run these scripts against a database containing data you need to keep.
4. Deploy the API and copy its public URL from Render. In the static site's environment settings, set `VITE_API_URL` to that URL followed by `/api` (for example, `https://your-api.onrender.com/api`), then trigger a new static-site deploy. Vite embeds this value at build time.
5. Copy the static site's public URL and set the API service's `FRONTEND_URL` to that exact origin (for example, `https://your-site.onrender.com`, without a trailing slash). Redeploy the API; this restricts production CORS to your site.
6. Create an Admin account securely before launch. Public sign-up creates Sales accounts only. Do not use the development seed-user script in production because it installs predictable demo credentials.

The Blueprint rewrites frontend routes to `index.html` for React Router and configures `/api/health` as the API health check. Free Render web services may sleep when idle and take time to wake up.

=======
>>>>>>> 9eb0d96ef5a0b1fe3d8fd7867d536603b82fa08d
## Troubleshooting

- Database connection failure: confirm MySQL is running and `.env` values match the server.
- CORS or network failure: confirm the backend is running on port 5000 and `VITE_API_URL` is correct.
- Login failure: confirm users exist and the database seed completed.
- Empty stock: seed products first, then record a purchase through the Admin Stock page.
- Port conflict: change `PORT` for the backend or the Vite port in `frontend/vite.config.js`.
