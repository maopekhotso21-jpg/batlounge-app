# Testing and Verification Guide

## Static Checks

Frontend build:

```bash
cd frontend
npm run build
```

Backend syntax check in PowerShell:

```powershell
Get-ChildItem .\backend\src -Recurse -Filter *.js | ForEach-Object { node --check $_.FullName }
```

## Manual Acceptance Test

1. Start MySQL, backend, and frontend.
2. Log in as Admin.
3. Verify the dashboard metrics and charts load.
4. Create or edit a fruit and confirm search and status filtering.
5. Verify Small, Medium, and Large box sizes.
6. Create a supplier from each required province or test the province filter.
7. Record stock and confirm available quantity increases.
8. Register an active street vendor.
9. Create a multi-line order and confirm subtotals and total.
10. Attempt an order quantity above stock and confirm it is rejected.
11. Move an order through its statuses and complete it.
12. Confirm stock decreases only when the order is completed.
13. Open each Admin report.
14. Log out and log in as Sales.
15. Confirm Sales can use vendors and orders but receives no Admin navigation.
16. Confirm a direct Admin-only URL redirects to Unauthorized.
17. Refresh the browser and confirm the saved session is restored.

## Expected HTTP Checks

- Missing token returns `401`.
- Sales accessing Admin reports returns `403`.
- Missing records return `404`.
- Duplicate records return `409` where applicable.
- Invalid input returns `400`.
