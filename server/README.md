# Backend API (week 11 defense)

Express + `db.json` file storage. Passwords are **never stored plain text**: register uses **bcrypt** hashes; only the hash is written to `users` in `db.json`.

## Run

```bash
cd server
npm install
npm start
```

Default: **http://localhost:3000**  
CORS is enabled for browser requests from your Vite dev server.

---

## How this maps to your requirements

| Requirement | Where it is |
|-------------|-------------|
| Registration + authentication, password **hashed** | `POST /register` (bcrypt hash → `db.json`), `POST /login` (compare with `bcrypt.compare`) |
| At least **3** tables / collections | **`users`**, **`categories`**, **`products`**, **`orders`** (four collections in one JSON file — more than required) |
| **One-to-many** (not user–role) | **Category → products** via `product.categoryId`. **User → orders** via `order.userId` |
| **CRUD** (create, read all, read one by id, update, delete) | See tables below — each resource exposes all five operations where it makes sense |

**Users — create:** **`POST /register`** or **`POST /users`** — both hash the password with bcrypt before saving.

**Users — read / update / delete:** `GET /users`, `GET /users/:id`, `PUT /users/:id`, `DELETE /users/:id`. Change password: `PATCH /users/:id/password` with `currentPassword` and `newPassword`. Responses **never** include `password`.

---

## Data model (`db.json`)

- **`users`**: `{ id, email, name?, password }` — `password` is bcrypt hash (do not send from frontend except as the raw password on register/login).
- **`categories`**: `{ id, name }`
- **`products`**: `{ id, name, price, categoryId, description }` — many products point to one category.
- **`orders`**: `{ id, userId, total, status }` — many orders can point to one user.

After you register, open `db.json` and show the defense: user exists, `password` field is a long hash string, not the real password.

---

## API reference

Base URL: `http://localhost:3000`  
JSON bodies: `Content-Type: application/json`

### Auth

| Method | Path | Body | Notes |
|--------|------|------|--------|
| POST | `/register` | `{ "email", "password", "name"? }` | 201 `{ user }` without password |
| POST | `/login` | `{ "email", "password" }` | 200 `{ user }` or 401 |

### Users (password never in JSON responses)

| Method | Path | Notes |
|--------|------|--------|
| GET | `/users` | list |
| GET | `/users/:id` | one |
| POST | `/users` | body `email`, `password`, `name?` (hashed like register) |
| PUT | `/users/:id` | body `name?`, `email?` |
| PATCH | `/users/:id/password` | body `currentPassword`, `newPassword` |
| DELETE | `/users/:id` | also removes that user’s orders |

### Categories

| Method | Path | Body (where needed) |
|--------|------|----------------------|
| GET | `/categories` | — |
| GET | `/categories/:id` | — |
| POST | `/categories` | `{ "name" }` |
| PUT | `/categories/:id` | `{ "name" }` |
| DELETE | `/categories/:id` | — |

### Products

| Method | Path | Body (where needed) |
|--------|------|----------------------|
| GET | `/products` | — |
| GET | `/products/:id` | — |
| POST | `/products` | `{ "name", "price"?, "categoryId"?, "description"? }` |
| PUT | `/products/:id` | any subset of fields to change |
| DELETE | `/products/:id` | — |

`categoryId` must match an existing category if provided.

### Orders

| Method | Path | Body (where needed) |
|--------|------|----------------------|
| GET | `/orders` | — |
| GET | `/orders/:id` | — |
| POST | `/orders` | `{ "userId", "total"?, "status"? }` — `userId` must exist |
| PUT | `/orders/:id` | optional `userId`, `total`, `status` |
| DELETE | `/orders/:id` | — |

---

## Quick tests (terminal)

Replace email if you already registered once.

```bash
# Register
curl -s -X POST http://localhost:3000/register -H "Content-Type: application/json" -d "{\"email\":\"a@b.com\",\"password\":\"secret123\",\"name\":\"Ada\"}"

# Login
curl -s -X POST http://localhost:3000/login -H "Content-Type: application/json" -d "{\"email\":\"a@b.com\",\"password\":\"secret123\"}"

# Products
curl -s http://localhost:3000/products
```

---

## Frontend (you implement — only pointers)

1. **Base URL** — e.g. `const API = 'http://localhost:3000'` (or Vite `proxy` if you prefer same-origin).
2. **Fetch** — `fetch(\`${API}/products\`)` then `res.json()`; for POST/PUT use `method`, `headers: { 'Content-Type': 'application/json' }`, `body: JSON.stringify(...)`.
3. **Routing** — React Router: list routes vs `/item/:id`, separate paths for create/edit like your week 9 prep.
4. **Context** — e.g. `AuthContext`: after login, store `{ user }` in state + `localStorage` if you want refresh to persist; logout clears it. Protect routes by checking `user` before rendering private pages (pattern from week 10 prep).
5. **Orders** — To create an order, `userId` must be a real id from login/register response (`user.id`). List orders with `GET /orders` for “showing orders.”
6. **Joining data in UI** — API does not embed `category` inside product; you can `GET /categories` and match `product.categoryId` in React, or show ids first and improve later.

If the backend returns an error JSON like `{ error: "..." }`, read `res.ok` and show the message in your UI.
