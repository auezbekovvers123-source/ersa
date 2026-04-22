# Финальное описание проекта (13 неделя)

Этот документ показывает, как проект закрывает все требования:

1. связь один-ко-многим не через users + CRUD по обеим таблицам;
2. роли пользователей и защита маршрутов по авторизации и роли;
3. Redux с двумя редьюсерами;
4. уведомления для auth и CRUD без `alert/confirm/prompt`;
5. подтверждение удаления через модальные окна.

---

## 1) Чеклист требований

### A. Связь один-ко-многим (не users) + CRUD по обеим таблицам

Реализованная связь:
- `categories (1) -> products (many)` via `product.categoryId`.

CRUD в backend:
- categories: `GET /categories`, `GET /categories/:id`, `POST /categories`, `PUT /categories/:id`, `DELETE /categories/:id`
- products: `GET /products`, `GET /products/:id`, `POST /products`, `PUT /products/:id`, `DELETE /products/:id`

CRUD в frontend:
- `src/pages/AdminProductsPage.jsx` (full product CRUD, admin-only)
- `src/pages/CategoriesPage.jsx` (full categories CRUD, admin-only)
- `src/pages/ProductsPage.jsx` (catalog/read-only for logged users)

Итог: требование полностью закрыто.

### B. Роли + защита маршрутов по авторизации и роли

Роли:
- users now include `role` with at least two values: `admin`, `user`.
- backend normalizes role in `server/server.js`.
- existing seed user in `server/db.json` is set to `admin`.

Защита:
- logged/not logged protection: `src/components/ProtectedRoute.jsx`
- role protection: same component supports `roles` prop and blocks access if user role is not allowed.

Маршруты по ролям:
- `src/App.jsx`:
  - `/categories` is protected with `roles={['admin']}`
  - `/admin/products` is protected with `roles={['admin']}`
  - `/products` is a normal logged-in catalog route without edit/delete
  - all internal routes still require login first

UI по ролям:
- `src/components/Layout.jsx` and `src/pages/HomePage.jsx` show `Manage Products` + `Categories` links only for admin.

Итог: требование полностью закрыто.

### C. Redux с 2 редьюсерами

Добавлены Redux Toolkit + React Redux.

Store:
- `src/store/index.js`

Редьюсеры (2):
- `notifications` reducer in `src/store/slices/notificationsSlice.js`
- `ui` reducer in `src/store/slices/uiSlice.js`

Где используются значения:
- notifications list rendered by `src/components/ToastViewport.jsx`
- ui values used in products search (`productSearch`) and global operations counter (`operationsCount`)

Итог: требование полностью закрыто.

### D. Уведомления для всех auth + CRUD операций (без alert/confirm/prompt)

Реализованы глобальные toast-уведомления:
- `src/components/ToastViewport.jsx`
- `src/hooks/useNotify.js`

Уведомления auth:
- `src/pages/LoginPage.jsx` (success/error)
- `src/pages/RegisterPage.jsx` (success/error)
- `src/components/Layout.jsx` logout notification

Уведомления CRUD:
- `src/pages/AdminProductsPage.jsx` (load errors + create/update/delete success/error)
- `src/pages/CategoriesPage.jsx` (load errors + create/update/delete success/error)

Итог: требование полностью закрыто.

### E. Подтверждение удаления через модальное окно (не `confirm()`)

Реализован переиспользуемый modal-компонент:
- `src/components/ConfirmModal.jsx`

Подтверждение удаления через modal:
- products delete in `src/pages/AdminProductsPage.jsx`
- categories delete in `src/pages/CategoriesPage.jsx`

No `window.confirm()` used anymore.

Итог: требование полностью закрыто.

---

## 2) Что добавлено/изменено по файлам

### Frontend (основа)

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

### Авторизация (Auth)

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

### Переиспользуемые UI-компоненты и хуки

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

### Стили

- `src/App.css`
  - toast styles
  - modal styles
  - search input styles
  - button variant for destructive confirm action
  - catalog card/grid styles for user products page

---

## 3) Как запускать

Нужны два терминала.

Backend:
1. `cd server`
2. `npm install`
3. `npm run dev`

Frontend:
1. in project root run `npm install`
2. run `npm run dev`
3. open `http://localhost:5173`

---

## 4) Как показать требования на защите

### Демо 1: Auth + Protected routes
1. Выйдите из аккаунта.
2. Откройте `/products` напрямую -> редирект на login.
3. Войдите в систему -> маршруты становятся доступными.

### Демо 2: Маршрутизация по ролям
1. Зарегистрируйтесь/войдите как `user`.
2. Откройте `/categories` -> доступ запрещен, редирект на home.
3. Зарегистрируйтесь/войдите как `admin`.
4. Откройте `/categories` -> доступ разрешен.

### Демо 3: CRUD для связи один-ко-многим
1. Как admin создайте/измените/удалите категории на странице Categories.
2. Создайте/измените/удалите продукты на странице `Manage Products`, привяжите категорию.
3. Откройте пользовательскую страницу `Products` и покажите карточки каталога с категорией.

### Демо 4: Уведомления
1. Выполните login/register/logout -> появятся toast-уведомления.
2. Выполните create/update/delete в products/categories -> появятся success toasts.
3. Вызовите ошибку API (остановите backend) -> появится error toast.

### Демо 5: Модальное подтверждение удаления
1. Нажмите delete у продукта/категории.
2. Покажите, что открывается модальное окно подтверждения.
3. Cancel ничего не удаляет, Confirm удаляет запись.
4. `confirm()` браузера не используется.

### Демо 6: Разделение каталога и админ-панели
1. Войдите как `user` и откройте `/products` -> только каталог.
2. Убедитесь, что `user` не может открыть `/admin/products`.
3. Войдите как `admin` и откройте `/admin/products` -> доступна полная CRUD-панель.

---

## 5) Важные замечания

- Backend uses JSON file storage (`server/db.json`) for educational simplicity.
- Passwords are still hashed with `bcrypt`.
- Frontend role checks protect the UI/route behavior for project requirements.
- For real production security, role checks must also be enforced with token-based auth and server-side authorization middleware.

### Troubleshooting: "создал admin, но не могу управлять"

If an account exists in `server/db.json` without a `role` field, frontend fallback treats it as `user`, so admin pages stay locked.

Как исправить:
1. Откройте `server/db.json`.
2. Добавьте `"role": "admin"` в запись нужного пользователя.
3. Перезапустите backend (`cd server` -> `npm run dev`).
4. Выйдите из аккаунта и войдите снова.

---

## 6) Новая функция: popup товара + корзина для каждого пользователя

### Что добавлено

- Product cards now open a popup modal with details and quantity input.
- Popup contains `Add to cart` action.
- Each user has a separate cart saved in `localStorage`.
- Added a dedicated cart page with quantity update, remove item, clear cart, and total.
- Navigation now includes cart link with live item count.

### Маршруты

- `GET UI /products`: catalog view for browsing and opening product popup.
- `GET UI /cart`: cart page for current logged user.

### Логика хранения корзины по пользователю

Формат ключа корзины:
- `teamproject_cart_user_<userId>`

Это гарантирует:
- User A cart is separate from User B cart.
- Logging in with another account shows that account's own cart.

### Новые файлы

- `src/cartStorage.js` - reusable cart read/write/add helpers.
- `src/pages/CartPage.jsx` - cart UI page.

### Обновленные файлы

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

### Как показать на защите

1. Войдите под любым пользователем.
2. Откройте `/products`.
3. Нажмите `View details` у товара.
4. Выберите количество и нажмите `Add to cart`.
5. Откройте `/cart` и проверьте корректные subtotal/total.
6. Выйдите, войдите под другим пользователем и убедитесь, что корзина другая (персональная).
