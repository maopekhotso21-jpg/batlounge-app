# API Reference

Base URL: `http://localhost:5000/api`

Protected endpoints require:

```http
Authorization: Bearer <jwt-token>
Content-Type: application/json
```

## Authentication

| Method | Path | Access | Purpose |
|---|---|---|---|
| POST | `/auth/login` | Public | Authenticate a user |
| POST | `/auth/register` | Admin | Create a user |
| GET | `/auth/me` | Authenticated | Read current user |
| PUT | `/auth/change-password` | Authenticated | Change current password |

## Fruits

| Method | Path | Access |
|---|---|---|
| GET | `/fruits` | Admin, Sales |
| GET | `/fruits/:id` | Admin, Sales |
| POST | `/fruits` | Admin |
| PUT | `/fruits/:id` | Admin |
| DELETE | `/fruits/:id` | Admin |

Supports `search` and `status` query parameters.

## Box Sizes

| Method | Path | Access |
|---|---|---|
| GET | `/box-sizes` | Admin, Sales |
| GET | `/box-sizes/:id` | Admin, Sales |
| POST | `/box-sizes` | Admin |
| PUT | `/box-sizes/:id` | Admin |
| DELETE | `/box-sizes/:id` | Admin |

## Suppliers

| Method | Path | Access |
|---|---|---|
| GET | `/suppliers` | Admin |
| GET | `/suppliers/:id` | Admin |
| POST | `/suppliers` | Admin |
| PUT | `/suppliers/:id` | Admin |
| DELETE | `/suppliers/:id` | Admin |

Supports `search`, `province`, and `status` query parameters.

## Street Vendors

| Method | Path | Access |
|---|---|---|
| GET | `/vendors` | Admin, Sales |
| GET | `/vendors/:id` | Admin, Sales |
| POST | `/vendors` | Admin, Sales |
| PUT | `/vendors/:id` | Admin, Sales |
| DELETE | `/vendors/:id` | Admin, Sales |

Supports `search` and `status` query parameters.

## Stock and Purchases

| Method | Path | Access | Purpose |
|---|---|---|---|
| GET | `/stock` | Admin, Sales | List products and stock |
| GET | `/stock/purchases` | Admin, Sales | List purchase history |
| POST | `/stock` | Admin | Record purchase and increase stock |
| PUT | `/stock/:id` | Admin | Update price, stock, and status |

`GET /stock` supports `search` and `lowStock=true`.

## Orders

| Method | Path | Access | Purpose |
|---|---|---|---|
| GET | `/orders` | Admin, Sales | List filtered orders |
| GET | `/orders/:id` | Admin, Sales | Read order and items |
| POST | `/orders` | Admin, Sales | Create a pending order |
| PUT | `/orders/:id` | Admin, Sales | Edit an editable order |
| PATCH | `/orders/:id/status` | Admin, Sales | Change order status |
| DELETE | `/orders/:id` | Admin, Sales | Delete a non-completed order |

List filters include `status`, `vendor_id`, `search`, `from`, and `to`.

## Reports

All report endpoints require Admin:

```text
GET /reports/dashboard
GET /reports/sales-by-box-size
GET /reports/sales-by-vendor
GET /reports/purchases-by-province
GET /reports/pending-orders
GET /reports/completed-orders
GET /reports/total-sales-by-date
GET /reports/top-selling-fruits
```

## Common Responses

- `200`: successful read or update
- `201`: successful create
- `400`: invalid request or missing reference
- `401`: missing or invalid token
- `403`: insufficient role
- `404`: route or record not found
- `409`: duplicate or referenced record conflict
- `500`: unexpected server error
