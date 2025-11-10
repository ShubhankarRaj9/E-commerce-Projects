
# Ecommerce (Monorepo)
 a full‑stack e-commerce platform that demonstrates a complete online store flow.
It includes an Express.js API backend, a Vite + React customer-facing storefront, and a Vite-powered admin dashboard.
Key features: product catalog and detail pages, user authentication, shopping cart, Razorpay checkout and server-side payment verification, order management, product reviews, and an AI-assisted product search endpoint.

The project is structured across three folders:

- `server/` — Express backend (APIs, database models, payment endpoints, admin controllers)
- `frontend/` — Customer-facing React app (Vite) with product browsing, cart, and checkout
- `dashboard/` — Admin dashboard (Vite) for managing products, orders and users

This README documents how to set up, run, and debug the project on Windows (PowerShell). It also calls out important environment variables and notes about Razorpay payment integration.

---

## Project structure (important folders)

- `server/` — Express app, controllers, routes, models and payment logic

  - `controllers/` — business logic (auth, products, payments, orders)
  - `routes/` — API route definitions
  - `models/` — database models (orders, products, users, payments)
  - `config/config.env` — environment variables used by the server

- `frontend/` — customer React app (Vite + Tailwind)

  - `src/components/` — UI components (PaymentForm, ProductCard, CartSidebar, etc.)
  - `src/hooks/` — custom hooks (`useRazorpay.js` exists)
  - `src/lib/` — helper code (axios instance, Razorpay loader)
  - `config/razorpay.js` — frontend config references

- `dashboard/` — admin UI (separate Vite app)

---

## Prerequisites

- Node.js (recommended v16+) and npm
- A running SQL database (see `server` database configuration in `config.env`) or a configured DB server
- Razorpay account with API Key ID and Secret (for payments)

Optional tools:

- git
- nodemon (for easier server development)

---

## Environment variables

The server and frontend expect several environment variables. Add them to `server/config/config.env` and to the frontend's `.env` file (or your shell) before running.

Typical server variables (add exact names to `server/config/config.env`):

- PORT=3000
- NODE_ENV=development
- DB_HOST=your_db_host
- DB_PORT=3306
- DB_USER=your_db_user
- DB_PASSWORD=your_db_password
- DB_NAME=your_database_name
- JWT_SECRET=your_jwt_secret
- JWT_EXPIRES=7d
- RAZORPAY_KEY_ID=rzp_test_xxx
- RAZORPAY_KEY_SECRET=your_razorpay_secret
- EMAIL_HOST=smtp.example.com
- EMAIL_PORT=587
- EMAIL_USER=you@example.com
- EMAIL_PASS=your_email_password

Frontend environment variables (Vite/Cra mismatch notes below):

- REACT_APP_RAZORPAY_KEY_ID or VITE_RAZORPAY_KEY_ID (set whichever your frontend code expects). Example:

  REACT_APP_RAZORPAY_KEY_ID=rzp_test_xxx

Note: the frontend currently uses `process.env.REACT_APP_RAZORPAY_KEY_ID` in `src/hooks/useRazorpay.js`. Because this project is built with Vite, you may prefer to use `VITE_` prefixed variables and update the code to use `import.meta.env.VITE_RAZORPAY_KEY_ID`.

---

## Install & run (PowerShell examples)

Open a PowerShell terminal and run the commands below for each sub-project.

1. Server

```powershell
cd .\server
npm install
# If package.json provides a dev script (common):
# npm run dev
# Otherwise start directly:
node server.js
```

Check `server/package.json` for available scripts (start/dev). Use `npm run dev` if a development script is present.

2. Frontend (customer app)

```powershell
cd ..\frontend
npm install
npm run dev
```

Vite's dev server will start and typically show a local URL (e.g. http://localhost:5173). Open that URL in your browser.

3. Dashboard (admin)

```powershell
cd ..\dashboard
npm install
npm run dev
```

4. Notes about ports & proxies

- The frontend expects the backend to be reachable at the base URL configured in `frontend/src/lib/axios.js` (check the baseURL there). If your server runs on a different port, either update the axios baseURL or use a proxy.

---

## Razorpay integration notes

- The server creates Razorpay orders and verifies signatures using the server-side secret key (`RAZORPAY_KEY_SECRET`). Keep this secret on the server only.
- The frontend loads the Razorpay SDK and opens a checkout with the `order_id` created by the server. After payment, the frontend sends the razorpay response to the server `/api/v1/payment/verify` endpoint for server-side verification.
- Typical flow:
  1. Client requests server to create an order (server calls Razorpay Orders API with secret key).
  2. Server returns order id + amount + currency + public key (key id).
  3. Client opens Razorpay checkout with returned order details.
  4. Razorpay returns a payment id + signature — the client sends these to server.
  5. Server verifies signature using Razorpay secret. If valid, server marks order paid.

Security tips:

- Never expose the Razorpay secret key in the frontend.
- Verify the Razorpay signature on the server before giving the user a success state or fulfilling the order.

---

## API endpoints (summary)

Below is a concise list of the main API endpoints implemented in `server/routes` with the expected HTTP method and path. Replace the base path below with the actual API prefix used by your server (commonly `/api/v1`).

- Auth

  - POST /auth/register — register a new user
  - POST /auth/login — authenticate and receive token/cookie
  - GET /auth/me — get current authenticated user (requires auth)
  - GET /auth/logout — logout current user
  - POST /auth/password/forgot — request password reset
  - PUT /auth/password/reset/:token — reset password using token
  - PUT /auth/password/update — update password (requires auth)
  - PUT /auth/profile/update — update profile (requires auth)

- Products

  - POST /products/admin/create — create a new product (admin)
  - GET /products/ — list all products
  - PUT /products/admin/update/:productID — update a product (admin)
  - DELETE /products/admin/delete/:productID — delete a product (admin)
  - GET /products/singleProduct/:productID — fetch single product details
  - PUT /products/post-new/review/:productID — post a review (auth)
  - DELETE /products/delete/review/:productID — delete a review (auth)
  - POST /products/ai-search — authenticated AI filtered product search

- Orders

  - POST /orders/new — create/place a new order (requires auth)
  - GET /orders/:orderId — fetch a single order (requires auth)
  - GET /orders/orders/me — fetch current user's orders (requires auth)
  - GET /orders/admin/getall — fetch all orders (admin)
  - PUT /orders/admin/update/:orderId — update order status (admin)
  - DELETE /orders/admin/delete/:orderId — delete an order (admin)

- Payments

  - POST /payment/order — create a Razorpay order (requires auth)
  - GET /payment/getKey — return public Razorpay key (requires auth)
  - POST /payment/verify — verify Razorpay payment signature (requires auth)

- Admin
  - GET /admin/getallusers — fetch all users (admin)
  - DELETE /admin/delete/:id — delete a user (admin)
  - GET /admin/fetch/dashboard — fetch dashboard stats (admin)

## System workflow examples

This section describes common workflows and which endpoints are involved. These help developers and testers follow the happy path when validating the system.

1. Shopper — browse to payment (happy path)

- Frontend: fetch product list — GET `/products/` (render product cards)
- Frontend: open product detail page — GET `/products/singleProduct/:productID`
- Frontend: add item(s) to cart (local state)
- Frontend: start checkout — POST `/payment/order` with cart and shipping info (server creates Razorpay order)
- Server: calls Razorpay Orders API (secret) and returns order id, amount, currency and public key
- Frontend: load Razorpay SDK and open checkout with returned order
- Razorpay: user completes payment and client receives payment id + signature
- Frontend: POST `/payment/verify` with razorpay_payment_id, razorpay_order_id, razorpay_signature
- Server: verifies signature and, if valid, marks order paid and creates an internal order record (POST `/orders/new` may be used depending on implementation)
- Frontend: clear cart and show success; optionally GET `/orders/orders/me` to fetch order history

2. Admin — view orders and update status

- Admin: GET `/orders/admin/getall` to list all orders
- Admin: PUT `/orders/admin/update/:orderId` to update status (shipped/delivered)
- Admin: GET `/admin/fetch/dashboard` to show dashboard metrics

3. User management — registration / password reset

- Create account: POST `/auth/register`
- Login: POST `/auth/login` (get auth token/cookie)
- Forgot password: POST `/auth/password/forgot` (server sends reset email)
- Reset password: PUT `/auth/password/reset/:token`

---

## Quick verification checklist

1. Start the server and verify API responds:`GET /api/v1/health` or `GET /api/v1/products` (if available).
2. Start the frontend. Browse to a product page and add an item to the cart.
3. Proceed to checkout; the frontend should request an order from the server and open Razorpay popup.
4. Complete a test payment (Razorpay test mode) and confirm the server logs verification success and order status updates.
5. Check the dashboard to see the created order appear in the orders list.

---

## Troubleshooting & common issues

- CORS errors: Make sure the server allows requests from the frontend origin. Check server CORS middleware configuration.
- Env variable mismatch: For Vite apps, use `VITE_` variables and `import.meta.env`. If code expects `process.env.REACT_APP_*` you can either change the code or add those variables at build time.
- Razorpay SDK not loading: Ensure your frontend uses the correct script loader (check `frontend/src/lib/loadRazoryPay.js`) and that the network is allowed to fetch `https://checkout.razorpay.com/v1/checkout.js`.
- Payment verification failing: Confirm server-side `RAZORPAY_KEY_SECRET` is correct and you are using the exact values returned from Razorpay when verifying signatures.

---

## Contributing

If you'd like to contribute, please:

1. Create an issue describing the feature or bug.
2. Create a branch: `git checkout -b feat/your-feature`.
3. Make changes and add tests where appropriate.
4. Submit a pull request describing the change.

---

## Next steps & optional improvements

- Add a Postman collection or OpenAPI spec to the repo for easier API testing.
- Convert frontend env usage to Vite conventions (use `VITE_` prefix and `import.meta.env`).
- Add automated tests for payment verification logic on the server.

---
