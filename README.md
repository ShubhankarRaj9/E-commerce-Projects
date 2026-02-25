🛒 E-Commerce Platform with AI Integration

🔗 Live Frontend: https://e-commerce-projects-5dk6.vercel.app/

🔗 Admin Dashboard: https://e-commerce-projects-9vsf.vercel.app/login

📌 Overview

A full-stack E-Commerce Platform that simulates a complete online shopping experience. It includes a customer-facing storefront, an admin dashboard, and a robust backend API with payment integration and AI-powered product search.

This project demonstrates real-world features such as authentication, cart management, order processing, and secure payment verification.

🚀 Tech Stack

Frontend: React (Vite), Tailwind CSS

Backend: Node.js, Express.js

Database: SQL

Payments: Razorpay

Deployment: Vercel

✨ Features

🛍️ Product listing & detail pages

🔐 User authentication (JWT-based)

🛒 Shopping cart functionality

💳 Razorpay payment integration with server-side verification

📦 Order management system

⭐ Product reviews & ratings

🤖 AI-based product search

🧑‍💼 Admin dashboard (manage users, products, orders)

📂 Project Structure
server/     → Backend (APIs, database, payment logic)
frontend/   → Customer-facing React app
dashboard/  → Admin panel (React + Vite)
⚙️ Installation & Setup
1️⃣ Clone Repository
git clone <your-repo-link>
cd project-folder
2️⃣ Setup Backend
cd server
npm install
node server.js
3️⃣ Setup Frontend
cd ../frontend
npm install
npm run dev
4️⃣ Setup Admin Dashboard
cd ../dashboard
npm install
npm run dev
🔑 Environment Variables

Create a config.env file in server/:

PORT=3000
DB_HOST=your_db_host
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=your_db_name
JWT_SECRET=your_secret
RAZORPAY_KEY_ID=your_key
RAZORPAY_KEY_SECRET=your_secret

For frontend:

VITE_RAZORPAY_KEY_ID=your_key
💳 Payment Flow (Razorpay)

Client requests order creation

Server creates Razorpay order

Client opens checkout

Payment completed

Server verifies signature

Order marked as successful

📡 API Highlights

Auth: Login, Register, Profile

Products: CRUD, Reviews, AI Search

Orders: Create, Track, Admin control

Payments: Order creation & verification

🧪 Testing Checklist

Browse products

Add to cart

Complete Razorpay test payment

Verify order in dashboard

⚠️ Important Notes

Keep Razorpay secret key secure (backend only)

Use VITE_ env variables for frontend (Vite standard)

Ensure CORS is properly configured

📈 Future Improvements

Add automated testing

Implement wishlist feature

Improve AI recommendations

Add OpenAPI / Postman docs

🤝 Contributing

Fork the repo

Create a new branch

Make changes

Submit a pull request

📄 License

This project is open-source and available under the MIT License.
