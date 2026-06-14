# ShopHub — E-Commerce Product Catalog

Full-stack e-commerce application: **React.js** frontend + **Node.js/Express** backend + **MySQL** database.

## Features

- Product listing with advanced search (full-text), filtering (category, brand, price, rating, stock), and sorting
- Category-based data modeling (self-referencing category tree)
- Backend pagination with indexed queries
- API-driven architecture (RESTful, modular services/controllers/routes)
- JWT authentication, cart, and wishlist
- Data validation/sanitization via `express-validator`
- Security middleware: helmet, rate limiting, CORS

## Project Structure

```
ecommerce/
├── backend/
│   ├── config/        # DB pool config
│   ├── controllers/   # Request handlers
│   ├── routes/        # Express routers
│   ├── services/      # Business logic / query building
│   ├── middleware/     # auth, validation, error handling
│   ├── db/            # schema.sql, migrate.js, seed.js
│   └── server.js
└── frontend/
    └── src/
        ├── components/  # Header, Footer, ProductCard, Filters, Pagination
        ├── pages/        # Home, ProductList, ProductDetail, Cart, Wishlist, Login, Register
        ├── context/      # Auth, Cart, Wishlist
        └── services/     # api.js (axios)
```

## Setup

### 1. Database
```bash
cd backend
cp .env.example .env   # edit DB credentials
npm install
npm run migrate         # creates schema
npm run seed             # inserts sample data
npm run dev               # starts API on :5000
```

### 2. Frontend
```bash
cd frontend
cp .env.example .env
npm install
npm start                 # starts React app on :3000
```

## Key API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/products?search=&category=&brand=&minPrice=&maxPrice=&minRating=&inStock=&sort=&page=&limit=` | Search/filter/paginate products |
| GET | `/api/products/:idOrSlug` | Product detail |
| GET | `/api/categories` | Category tree |
| POST | `/api/auth/register` / `/api/auth/login` | Auth |
| GET/POST/PUT/DELETE | `/api/cart` | Cart (auth required) |
| GET/POST/DELETE | `/api/wishlist` | Wishlist (auth required) |

## Notes
- Replace `picsum.photos` thumbnail URLs in `db/seed.js` with real product images for production.
- Add a checkout/payment service under `services/` to extend the `orders` tables already in `schema.sql`.
