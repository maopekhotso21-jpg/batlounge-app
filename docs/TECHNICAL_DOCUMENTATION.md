# Technical Documentation

## Purpose

The Batloung system digitises fruit purchasing, stock control, vendor registration, order processing, and reporting. It connects a React single-page application to an Express REST API and MySQL database.

## Architecture

1. Presentation tier: React pages and reusable Tailwind components.
2. Application tier: Express routes, controllers, validation, authentication, and authorization.
3. Data tier: MySQL tables accessed through a mysql2 promise connection pool.

See [diagrams/ARCHITECTURE.md](diagrams/ARCHITECTURE.md).

## Frontend Modules

- `pages/`: Login, Dashboard, Fruits, BoxSizes, Suppliers, Stock, Vendors, Orders, CreateOrder, OrderDetails, Reports, Unauthorized, and NotFound.
- `components/layout/`: responsive sidebar, topbar, and route layout.
- `components/ui/`: buttons, inputs, selects, cards, tables, modals, badges, loaders, and empty states.
- `context/`: persisted authentication and temporary toast notifications.
- `services/`: Axios configuration and endpoint wrappers.
- `routes/`: role-aware route guards.

## Backend Modules

- `controllers/`: database operations and business rules.
- `routes/`: endpoint-to-controller mappings.
- `middleware/`: JWT authentication, role authorization, and error handling.
- `utils/`: validation helpers and async error forwarding.
- `config/db.js`: MySQL connection pool.

## Database Design

The database contains users, suppliers, fruits, box sizes, products, street vendors, purchases, orders, and order items. A product is the unique combination of one fruit and one box size, allowing different prices and stock for Apples Small, Apples Medium, and Apples Large.

Relationships:

- Supplier to purchases: one-to-many
- Fruit to products: one-to-many
- Box size to products: one-to-many
- Product to purchases: one-to-many
- Street vendor to orders: one-to-many
- Order to order items: one-to-many
- Product to order items: one-to-many

See [diagrams/ERD.md](diagrams/ERD.md).

## Business Rules

- Fruit names are limited to the five required fruits.
- Box sizes are Small, Medium, and Large.
- Supplier province must be one of the nine South African provinces.
- Product prices and required quantities must be positive.
- An order belongs to an existing active vendor and has at least one item.
- Requested quantity cannot exceed available stock.
- Prices and totals are calculated from database prices.
- Completing an order deducts stock inside a transaction.
- Cancelled orders do not deduct stock.
- Completed orders cannot be reopened or deleted.
- Foreign keys preserve relationships between records.

## Security

- Passwords are hashed with bcryptjs.
- Login returns a signed JWT containing user ID, username, and role.
- Protected requests require a Bearer token.
- Admin-only routes are enforced by backend middleware.
- SQL statements use parameter placeholders.
- Production error responses do not expose stack traces.

## Transactions

Stock intake, order creation, order editing, and order completion use database transactions. Order creation and completion lock relevant product rows with `FOR UPDATE` before checking or changing stock. Failures roll back the transaction and release the connection.

## Scope Limits

The application is single-tenant, displays currency in Maloti (`M`), and does not include payments, SMS, email notifications, or a native mobile client.
