# Team Project Final Explanation

This document explains exactly how the project now satisfies all required points:

1. one-to-many relation not based on users + CRUD on both tables,
2. user roles with protected routing for auth and role,
3. Redux with two reducers,
4. notifications for auth + CRUD operations without `alert/confirm/prompt`,
5. modal confirmation for all delete operations.

---

## 1) Requirements Checklist

### A. One-to-many relation (not users) + CRUD on both tables

Implemented relation:
- `categories (1) -> products (many)` via `product.categoryId`.

Backend CRUD:
- categories: `GET /categories`, `GET /categories/:id`, `POST /categories`, `PUT /categories/:id`, `DELETE /categories/:id`
- products: `GET /products`, `GET /products/:id`, `POST /products`, `PUT /products/:id`, `DELETE /products/:id`

Frontend CRUD pages:
- `src/pages/AdminProductsPage.jsx` (full product CRUD, admin-only)
- `src/pages/CategoriesPage.jsx` (full categories CRUD, admin-only)
- `src/pages/ProductsPage.jsx` (catalog/read-only for logged users)

Result: requirement is fully covered on both sides.

### B. Roles + protected routes by auth and role

Roles:
- users now include `role` with at least two values: `admin`, `user`.
- backend normalizes role in `server/server.js`.
- existing seed user in `server/db.json` is set to `admin`.

Protection:
- logged/not logged protection: `src/components/ProtectedRoute.jsx`
- role protection: same component supports `roles` prop and blocks access if user role is not allowed.

Role-based routes:
- `src/App.jsx`:
  - `/categories` is protected with `roles={['admin']}`
  - `/admin/products` is protected with `roles={['admin']}`
  - `/products` is a normal logged-in catalog route without edit/delete
  - all internal routes still require login first

Role-based UI:
- `src/components/Layout.jsx` and `src/pages/HomePage.jsx` show `Manage Products` + `Categories` links only for admin.

Result: requirement is fully covered.

### C. Redux with 2 reducers

Added Redux Toolkit + React Redux.

Store:
- `src/store/index.js`

Reducers (2):
- `notifications` reducer in `src/store/slices/notificationsSlice.js`
- `ui` reducer in `src/store/slices/uiSlice.js`

Where values are used:
- notifications list rendered by `src/components/ToastViewport.jsx`
- ui values used in products search (`productSearch`) and global operations counter (`operationsCount`)

Result: requirement is fully covered.

### D. Notifications for all auth + CRUD operations (without alert/confirm/prompt)

Implemented global toast notifications:
- `src/components/ToastViewport.jsx`
- `src/hooks/useNotify.js`

Auth notifications:
- `src/pages/LoginPage.jsx` (success/error)
- `src/pages/RegisterPage.jsx` (success/error)
- `src/components/Layout.jsx` logout notification

CRUD notifications:
- `src/pages/AdminProductsPage.jsx` (load errors + create/update/delete success/error)
- `src/pages/CategoriesPage.jsx` (load errors + create/update/delete success/error)

Result: requirement is fully covered.

### E. Delete operations must use modal confirmation (not `confirm()`)

Implemented reusable confirmation modal:
- `src/components/ConfirmModal.jsx`

Delete confirmation using modal:
- products delete in `src/pages/AdminProductsPage.jsx`
- categories delete in `src/pages/CategoriesPage.jsx`

No `window.confirm()` used anymore.

Result: requirement is fully covered.

---

## 2) File-by-File What Was Added/Changed

### Frontend Core

- `src/main.jsx`
  - wrapped app with Redux `<Provider store={store}>`
  - mounted global `ToastViewport`

- `src/App.jsx`
  - added admin-only routes for `/categories` and `/admin/products`
  - kept `/products` as user catalog route

- `src/components/ProtectedRoute.jsx`
  - now supports `roles` prop for role-based protection

- `src/components/Layout.jsx`
  - shows role and operations counter
  - admin-only `Manage Products` and `Categories` nav links
  - logout notification

- `src/pages/HomePage.jsx`
  - admin-only shortcuts for `Manage Products` and `Categories`

### Auth

- `src/context/AuthContext.jsx`
  - added `normalizeUser` (ensures role fallback)
  - register now sends/handles role
  - persisted user is normalized

- `src/pages/LoginPage.jsx`
  - notification on login success/error

- `src/pages/RegisterPage.jsx`
  - added role selector (`user`/`admin`) for testing role routing
  - notification on register success/error

### CRUD UI

- `src/pages/ProductsPage.jsx`
  - converted to a read-only catalog view (no create/edit/delete)
  - card/grid UI for users
  - local search for catalog browsing

- `src/pages/AdminProductsPage.jsx` (new)
  - full products CRUD for admin only
  - notifications on load/save/delete
  - delete uses modal
  - increments global operations counter on successful create/update/delete

- `src/pages/CategoriesPage.jsx` (new)
  - full categories CRUD UI
  - notifications on load/save/delete
  - delete uses modal
  - increments global operations counter

### Reusable UI + Hooks

- `src/components/ConfirmModal.jsx` (new)
- `src/components/ToastViewport.jsx` (new)
- `src/hooks/useNotify.js` (new)

### Redux

- `src/store/index.js` (new)
- `src/store/slices/notificationsSlice.js` (new)
- `src/store/slices/uiSlice.js` (new)

### Backend

- `server/server.js`
  - added role normalization
  - user insert now stores `role`
  - users update endpoint can update role
  - register endpoint accepts role (defaults are normalized)

- `server/db.json`
  - existing user now has `"role": "admin"`

### Styles

- `src/App.css`
  - toast styles
  - modal styles
  - search input styles
  - button variant for destructive confirm action
  - catalog card/grid styles for user products page

---

## 3) How To Run

Use two terminals.

Backend:
1. `cd server`
2. `npm install`
3. `npm run dev`

Frontend:
1. in project root run `npm install`
2. run `npm run dev`
3. open `http://localhost:5173`

---

## 4) How To Demonstrate Requirements in Defense

### Demo 1: Auth + Protected routes
1. Log out.
2. Try to open `/products` directly -> redirected to login.
3. Login -> allowed to access app routes.

### Demo 2: Role-based routing
1. Register/login as `user`.
2. Try `/categories` -> blocked and redirected to home.
3. Register/login as `admin`.
4. Open `/categories` -> access granted.

### Demo 3: One-to-many CRUD
1. As admin, create/edit/delete categories in Categories page.
2. Create/edit/delete products in `Manage Products` page and assign category.
3. Open user `Products` page and show catalog cards with category mapping.

### Demo 4: Notifications
1. Perform login/register/logout -> see toast notifications.
2. Perform create/update/delete in products/categories -> see success toasts.
3. Trigger API error (stop backend) -> see error toast.

### Demo 5: Delete modal
1. Click delete on product/category.
2. Show confirmation modal appears.
3. Cancel does nothing, confirm deletes.
4. No browser `confirm()` is used.

### Demo 6: Catalog vs Admin panel split
1. Login as `user` and open `/products` -> see catalog only.
2. Confirm user cannot access `/admin/products`.
3. Login as `admin` and open `/admin/products` -> full CRUD panel appears.

---

## 5) Important Notes

- Backend uses JSON file storage (`server/db.json`) for educational simplicity.
- Passwords are still hashed with `bcrypt`.
- Frontend role checks protect the UI/route behavior for project requirements.
- For real production security, role checks must also be enforced with token-based auth and server-side authorization middleware.

### Troubleshooting: "I created admin but cannot manage"

If an account exists in `server/db.json` without a `role` field, frontend fallback treats it as `user`, so admin pages stay locked.

Fix:
1. Open `server/db.json`.
2. Add `"role": "admin"` to that user record.
3. Restart backend server (`cd server` -> `npm run dev`).
4. Log out and log in again.

---

## 6) New Feature: Product Popup + Per-User Cart

### What was added

- Product cards now open a popup modal with details and quantity input.
- Popup contains `Add to cart` action.
- Each user has a separate cart saved in `localStorage`.
- Added a dedicated cart page with quantity update, remove item, clear cart, and total.
- Navigation now includes cart link with live item count.

### Routes

- `GET UI /products`: catalog view for browsing and opening product popup.
- `GET UI /cart`: cart page for current logged user.

### Per-user storage logic

Cart storage key format:
- `teamproject_cart_user_<userId>`

This guarantees:
- User A cart is separate from User B cart.
- Logging in with another account shows that account's own cart.

### Files added

- `src/cartStorage.js` - reusable cart read/write/add helpers.
- `src/pages/CartPage.jsx` - cart UI page.

### Files updated

- `src/pages/ProductsPage.jsx`
  - added popup modal for product details
  - added quantity selector
  - added add-to-cart action
- `src/components/Layout.jsx`
  - added cart nav link with item count
  - listens for cart update event to refresh count
- `src/App.jsx`
  - added `/cart` route
- `src/pages/HomePage.jsx`
  - added cart shortcut link
- `src/App.css`
  - styles for cart quantity input/footer and popup quantity block

### How to demo

1. Log in as any user.
2. Open `/products`.
3. Click `View details` on a product.
4. Select quantity and click `Add to cart`.
5. Open `/cart` and confirm item appears with correct subtotal/total.
6. Log out, log in as a different user, and confirm cart is different (per-user persistence).
