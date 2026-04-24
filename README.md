# FlashCart Full Stack Grocery App

FlashCart is a Blinkit-inspired instant grocery delivery project built with React, Vite, Express, Node.js and MongoDB. It uses original branding and public product imagery so it can be deployed as a student/demo project without copying Blinkit's protected brand assets.

## Project Structure

```text
.
├── backend
│   ├── src
│   │   ├── data.js
│   │   ├── db.js
│   │   ├── middleware
│   │   │   └── auth.js
│   │   ├── models
│   │   │   ├── Category.js
│   │   │   ├── Order.js
│   │   │   ├── Product.js
│   │   │   └── User.js
│   │   └── server.js
│   ├── .env.example
│   └── package.json
├── frontend
│   ├── src
│   │   ├── lib
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── styles.css
│   ├── .env.example
│   ├── vercel.json
│   └── package.json
└── render.yaml
```

## Features

- Product categories, search and sorting
- MongoDB catalog seeding for products and categories
- Login and registration with hashed passwords and JWT sessions
- Responsive grocery storefront
- Add/remove cart quantities
- Price totals, delivery fee, handling fee and savings
- Authenticated checkout connected to MongoDB
- Persistent user order history
- Order status timeline for confirmed, packing, out for delivery and delivered
- Early order cancellation
- Render-ready backend config
- Vercel-ready frontend config

## Local Setup

Install dependencies:

```bash
npm run install:all
```

Create backend environment file:

```bash
cp backend/.env.example backend/.env
```

Then set `MONGODB_URI` in `backend/.env`. A MongoDB Atlas URI works well:

```text
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/flashcart
JWT_SECRET=replace-this-with-a-long-random-secret
```

Start the backend:

```bash
npm run dev:backend
```

Start the frontend in another terminal:

```bash
npm run dev:frontend
```

Open:

```text
http://localhost:5173
```

The frontend expects the backend at `http://localhost:8080` by default. If `MONGODB_URI` is missing, the catalog still loads from local seed data, but login and orders return a MongoDB connection message.

## Backend API

```text
GET    /api/health
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/me
GET    /api/categories
GET    /api/products
GET    /api/products?category=fresh&q=banana&sort=rating-desc
GET    /api/products/:productId
POST   /api/orders
GET    /api/orders
GET    /api/orders/:orderId
PATCH  /api/orders/:orderId/cancel
```

Example order payload:

```json
{
  "customer": {
    "name": "Aarav Sharma",
    "phone": "9876543210",
    "address": "House 12, Sector 22"
  },
  "paymentMethod": "UPI on delivery",
  "items": [
    {
      "productId": "banana-robusta",
      "quantity": 2
    }
  ]
}
```

Authenticated routes require:

```text
Authorization: Bearer <token>
```

## Deploy Backend To Render

1. Push this repository to GitHub.
2. In Render, create a new Blueprint from the repo, or create a Web Service manually.
3. If using manual setup:
   - Root directory: `backend`
   - Build command: `npm install`
   - Start command: `npm start`
4. Add environment variables:
   - `NODE_ENV=production`
   - `FRONTEND_URL=https://your-vercel-app.vercel.app`
   - `MONGODB_URI=mongodb+srv://.../flashcart`
   - `JWT_SECRET=<long-random-secret>`
5. Deploy and copy the backend URL, for example:

```text
https://flashcart-backend.onrender.com
```

## Deploy Frontend To Vercel

1. Import the same GitHub repo in Vercel.
2. Set the project root directory to `frontend`.
3. Add environment variable:

```text
VITE_API_URL=https://your-render-backend.onrender.com
```

4. Deploy.

After both apps are live, update the Render `FRONTEND_URL` value to your final Vercel URL so production CORS allows requests.
