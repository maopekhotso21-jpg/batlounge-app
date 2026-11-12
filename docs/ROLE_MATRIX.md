# Role and Access Matrix

## Admin

Administrators can:

- View the complete dashboard and all reports
- Create, edit, deactivate, and delete fruits
- Manage Small, Medium, and Large box sizes
- Create, edit, deactivate, and delete suppliers
- Record purchases and update product stock and prices
- Register, edit, search, and delete street vendors
- Create, edit, view, update, and delete orders subject to business rules
- Register users through the protected registration endpoint

## Sales

Sales users can:

- View the operational dashboard
- View products and current stock
- Register, edit, search, and manage street vendors
- Create and view orders
- Edit eligible orders
- Update order statuses according to backend rules

Sales users cannot access supplier management, fruit administration, box-size administration, stock mutation, or reports.

## Enforcement

Permissions are enforced in two places:

1. React routes and sidebar navigation hide pages the role cannot use and show `/unauthorized` for direct forbidden URLs.
2. Express middleware checks the JWT role on every protected backend route.

The backend remains authoritative; hiding a link in the frontend is not treated as security.
