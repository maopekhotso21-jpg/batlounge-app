# Batloung Fruits Distribution Management System

## Overview

Batloung Fruits purchases fruit from suppliers in the nine provinces of South Africa and sells fruit boxes to street vendors in Maseru. This full-stack application replaces manual records with validated, database-driven workflows.

The system manages fruits, box sizes, fruit-and-box products, suppliers, stock purchases, street vendors, orders, authentication, role permissions, and reports.

## Technology

- Frontend: React 18, Vite, Tailwind CSS, React Router, Axios, Recharts, Lucide React
- Backend: Node.js, Express, JWT, bcryptjs, mysql2
- Database: MySQL 8
- API base URL: `http://localhost:5000/api`

## Features

- Admin dashboard with stock, order, sales, and operational metrics
- Sales dashboard using only endpoints available to Sales users
- Fruit management for Apples, Bananas, Oranges, Mangoes, and Grapes
- Small, Medium, and Large box-size management
- Supplier management across all nine South African provinces
- Incoming stock purchases and automatic available-stock updates
- Street-vendor registration and management
- Multi-line orders with server-calculated prices and totals
- Order statuses: Pending, Confirmed, Processing, Ready for Collection/Delivery, Completed, Cancelled
- Stock validation and deduction when an order is completed
- Admin reports for sales, purchases, vendors, provinces, dates, fruits, and order status
- JWT authentication with Admin and Sales role-based access
- Responsive Tailwind UI with professional Lucide icons

## Project Structure

```text
backend/
  database/       MySQL schema and seed data
  scripts/        user seeding script
  src/
    config/       database connection pool
    controllers/  request and business logic
    middleware/   authentication, roles, and errors
    routes/       Express route definitions
    utils/        validation and async helpers
frontend/
  src/
    components/   layout, dashboard, and reusable UI components
    context/      authentication and toast state
    pages/        application screens
    routes/       protected route configuration
    services/     Axios client and API endpoints
    utils/        constants and formatting helpers
docs/             project, API, presentation, and diagram documentation
```

## Quick Start

Prerequisites: Node.js 18 or newer, npm, and MySQL 8.

1. Create the database:

   ```bash
   mysql -u root -p < backend/database/schema.sql
   mysql -u root -p Batloung_db < backend/database/seed.sql
   ```

2. Configure `backend/.env`:

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

3. Start the backend:

   ```bash
   cd backend
   npm install
   npm start
   ```

4. Optionally create `frontend/.env`:

   ```env
   VITE_API_URL=http://localhost:5000/api
   ```

5. Start the frontend in another terminal:

   ```bash
   cd frontend
   npm install
   npm run dev
   ```

Open the Vite URL, normally `http://localhost:5173`.

## Roles

| Capability | Admin | Sales |
|---|---:|---:|
| Dashboard | Yes | Yes, operational view |
| Fruits and box sizes | Manage | Not available |
| Suppliers and stock | Manage | Not available |
| Street vendors | Manage | Register and manage |
| Orders | Manage | Create, view, and update status |
| Reports | View | Not available |

The frontend hides unavailable navigation and the backend enforces the same permissions.

## Validation

```bash
cd frontend
npm run build
```

```powershell
Get-ChildItem .\backend\src -Recurse -Filter *.js | ForEach-Object { node --check $_.FullName }
```

See [docs/SETUP.md](docs/SETUP.md), [docs/API.md](docs/API.md), and [docs/TECHNICAL_DOCUMENTATION.md](docs/TECHNICAL_DOCUMENTATION.md).
