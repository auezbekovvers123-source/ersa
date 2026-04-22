# Финальное описание проекта

Этот документ объясняет, как проект закрывает основные требования:

1. связь один-ко-многим не через таблицу пользователей + CRUD для обеих таблиц;
2. роли пользователей и защита маршрутов по авторизации и роли;
3. Redux с двумя редьюсерами;
4. уведомления для auth/CRUD без `alert/confirm/prompt`;
5. подтверждение удаления через модальное окно.

---

## 1) Чеклист требований

### A. Связь один-ко-многим (не users) + CRUD по обеим сущностям

Реализована связь:
- `categories (1) -> products (many)` через `product.categoryId`.

CRUD в backend:
- категории: `GET /categories`, `GET /categories/:id`, `POST /categories`, `PUT /categories/:id`, `DELETE /categories/:id`
- продукты: `GET /products`, `GET /products/:id`, `POST /products`, `PUT /products/:id`, `DELETE /products/:id`

CRUD в frontend:
- `src/pages/AdminProductsPage.jsx` (полный CRUD, только для admin)
- `src/pages/CategoriesPage.jsx` (полный CRUD, только для admin)
- `src/pages/ProductsPage.jsx` (каталог только для просмотра)

Итог: требование закрыто.

### B. Роли + защита маршрутов

Роли:
- у пользователя есть `role` со значениями `admin`/`user`;
- нормализация роли выполняется в `server/server.js`;
- в `server/db.json` есть админ-пользователь.

Защита:
- защита «вошел/не вошел»: `src/components/ProtectedRoute.jsx`;
- защита по ролям: тот же компонент через проп `roles`.

Итог: требование закрыто.

### C. Redux с 2 редьюсерами

Добавлены:
- `src/store/slices/notificationsSlice.js`
- `src/store/slices/uiSlice.js`

Store:
- `src/store/index.js`

Итог: требование закрыто.

### D. Уведомления для auth и CRUD

Реализованы toast-уведомления:
- `src/components/ToastViewport.jsx`
- `src/hooks/useNotify.js`

Итог: требование закрыто.

### E. Подтверждение удаления через модалку

Используется переиспользуемый компонент:
- `src/components/ConfirmModal.jsx`

Удаление в продуктах/категориях подтверждается через модальное окно, `window.confirm()` не используется.

Итог: требование закрыто.

---

## 2) Основные изменения по файлам

- `src/App.jsx`: добавлены маршруты `/admin/products`, `/categories`, `/cart`
- `src/components/ProtectedRoute.jsx`: защита по ролям
- `src/pages/ProductsPage.jsx`: каталог только для просмотра + popup товара
- `src/pages/AdminProductsPage.jsx`: админ-панель CRUD продуктов
- `src/pages/CategoriesPage.jsx`: CRUD категорий (admin)
- `src/pages/CartPage.jsx`: корзина пользователя
- `src/cartStorage.js`: хранение корзины по `userId`
- `src/components/Layout.jsx`: навигация, счетчик корзины, logout

---

## 3) Как запускать

Нужно 2 терминала.

Backend:
1. `cd server`
2. `npm install`
3. `npm run dev`

Frontend:
1. в корне проекта: `npm install`
2. `npm run dev`
3. открыть `http://localhost:5173`

---

## 4) Важно

- Данные backend хранятся в `server/db.json`.
- Пароли хешируются через `bcrypt`.
- Проверка ролей на фронтенде сделана для учебной задачи; в production нужна полноценная серверная авторизация (token + middleware).
