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

## Troubleshooting

- Database connection failure: confirm MySQL is running and `.env` values match the server.
- CORS or network failure: confirm the backend is running on port 5000 and `VITE_API_URL` is correct.
- Login failure: confirm users exist and the database seed completed.
- Empty stock: seed products first, then record a purchase through the Admin Stock page.
- Port conflict: change `PORT` for the backend or the Vite port in `frontend/vite.config.js`.
