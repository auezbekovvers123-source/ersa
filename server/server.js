import express from "express";
import cors from "cors";
import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_FILE = path.join(__dirname, "db.json");
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: true }));
app.use(express.json());

function readDb() {
  const raw = fs.readFileSync(DB_FILE, "utf-8");
  return JSON.parse(raw);
}

function writeDb(db) {
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), "utf-8");
}

function nextId(items) {
  if (!items.length) return 1;
  return Math.max(...items.map((x) => Number(x.id))) + 1;
}

function userPublic(u) {
  if (!u) return null;
  const { password: _p, ...rest } = u;
  return rest;
}

function normalizeRole(role) {
  return role === "admin" ? "admin" : "user";
}

async function insertUser(db, { email, password, name, role }) {
  if (!email || !password) {
    return { status: 400, body: { error: "email and password required" } };
  }
  const em = String(email).trim();
  if (db.users.some((u) => u.email === em)) {
    return { status: 409, body: { error: "email already registered" } };
  }
  const hash = await bcrypt.hash(String(password), 10);
  const user = {
    id: nextId(db.users),
    email: em,
    name: name != null ? String(name).trim() : "",
    role: normalizeRole(role),
    password: hash,
  };
  db.users.push(user);
  return { user };
}

// ---------- Auth (passwords stored hashed with bcrypt) ----------
app.post("/register", async (req, res) => {
  try {
    const db = readDb();
    const out = await insertUser(db, {
      role: "user",
      ...(req.body || {}),
    });
    if (out.status) return res.status(out.status).json(out.body);
    writeDb(db);
    return res.status(201).json({ user: userPublic(out.user) });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "server error" });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ error: "email and password required" });
    }
    const db = readDb();
    const user = db.users.find((u) => u.email === email);
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: "invalid credentials" });
    }
    return res.json({ user: userPublic(user) });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "server error" });
  }
});

// ---------- Users CRUD (password never returned) ----------
app.get("/users", (req, res) => {
  const db = readDb();
  res.json(db.users.map(userPublic));
});

app.get("/users/:id", (req, res) => {
  const db = readDb();
  const u = db.users.find((x) => String(x.id) === String(req.params.id));
  if (!u) return res.status(404).json({ error: "not found" });
  res.json(userPublic(u));
});

app.post("/users", async (req, res) => {
  try {
    const db = readDb();
    const out = await insertUser(db, req.body || {});
    if (out.status) return res.status(out.status).json(out.body);
    writeDb(db);
    return res.status(201).json(userPublic(out.user));
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "server error" });
  }
});

app.put("/users/:id", (req, res) => {
  const db = readDb();
  const u = db.users.find((x) => String(x.id) === String(req.params.id));
  if (!u) return res.status(404).json({ error: "not found" });
  const { name, email, role } = req.body || {};
  if (email != null) {
    const em = String(email).trim();
    if (db.users.some((x) => x.id !== u.id && x.email === em)) {
      return res.status(409).json({ error: "email already in use" });
    }
    u.email = em;
  }
  if (name != null) u.name = String(name).trim();
  if (role != null) u.role = normalizeRole(role);
  writeDb(db);
  res.json(userPublic(u));
});

app.patch("/users/:id/password", async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body || {};
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: "currentPassword and newPassword required" });
    }
    if (String(newPassword).length < 6) {
      return res.status(400).json({ error: "newPassword must be at least 6 characters" });
    }
    const db = readDb();
    const u = db.users.find((x) => String(x.id) === String(req.params.id));
    if (!u) return res.status(404).json({ error: "not found" });
    if (!(await bcrypt.compare(String(currentPassword), u.password))) {
      return res.status(401).json({ error: "invalid current password" });
    }
    u.password = await bcrypt.hash(String(newPassword), 10);
    writeDb(db);
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "server error" });
  }
});

app.delete("/users/:id", (req, res) => {
  const db = readDb();
  const idStr = String(req.params.id);
  const idx = db.users.findIndex((x) => String(x.id) === idStr);
  if (idx === -1) return res.status(404).json({ error: "not found" });
  db.orders = db.orders.filter((o) => String(o.userId) !== idStr);
  const [removed] = db.users.splice(idx, 1);
  writeDb(db);
  res.json(userPublic(removed));
});

// ---------- Categories CRUD (one side of one-to-many) ----------
app.get("/categories", (req, res) => {
  res.json(readDb().categories);
});

app.get("/categories/:id", (req, res) => {
  const c = readDb().categories.find((x) => String(x.id) === String(req.params.id));
  if (!c) return res.status(404).json({ error: "not found" });
  res.json(c);
});

app.post("/categories", (req, res) => {
  const db = readDb();
  const { name } = req.body || {};
  if (!name || !String(name).trim()) {
    return res.status(400).json({ error: "name required" });
  }
  const row = { id: nextId(db.categories), name: String(name).trim() };
  db.categories.push(row);
  writeDb(db);
  res.status(201).json(row);
});

app.put("/categories/:id", (req, res) => {
  const db = readDb();
  const c = db.categories.find((x) => String(x.id) === String(req.params.id));
  if (!c) return res.status(404).json({ error: "not found" });
  const { name } = req.body || {};
  if (name != null) c.name = String(name).trim();
  writeDb(db);
  res.json(c);
});

app.delete("/categories/:id", (req, res) => {
  const db = readDb();
  const cid = Number(req.params.id);
  const idx = db.categories.findIndex((x) => Number(x.id) === cid);
  if (idx === -1) return res.status(404).json({ error: "not found" });
  if (db.products.some((p) => p.categoryId != null && Number(p.categoryId) === cid)) {
    return res.status(409).json({
      error: "category has products; reassign or delete products first",
    });
  }
  const [removed] = db.categories.splice(idx, 1);
  writeDb(db);
  res.json(removed);
});

// ---------- Products CRUD (many products -> one category) ----------
app.get("/products", (req, res) => {
  res.json(readDb().products);
});

app.get("/products/:id", (req, res) => {
  const p = readDb().products.find((x) => String(x.id) === String(req.params.id));
  if (!p) return res.status(404).json({ error: "not found" });
  res.json(p);
});

app.post("/products", (req, res) => {
  const db = readDb();
  const { name, price, categoryId, description } = req.body || {};
  if (!name || !String(name).trim()) {
    return res.status(400).json({ error: "name required" });
  }
  const cid = categoryId != null ? Number(categoryId) : null;
  if (cid && !db.categories.some((c) => c.id === cid)) {
    return res.status(400).json({ error: "invalid categoryId" });
  }
  const row = {
    id: nextId(db.products),
    name: String(name).trim(),
    price: price != null ? Number(price) : 0,
    categoryId: cid,
    description: description != null ? String(description) : "",
  };
  db.products.push(row);
  writeDb(db);
  res.status(201).json(row);
});

app.put("/products/:id", (req, res) => {
  const db = readDb();
  const p = db.products.find((x) => String(x.id) === String(req.params.id));
  if (!p) return res.status(404).json({ error: "not found" });
  const { name, price, categoryId, description } = req.body || {};
  if (name != null) p.name = String(name).trim();
  if (price != null) p.price = Number(price);
  if (categoryId !== undefined) {
    if (categoryId == null || categoryId === "") {
      p.categoryId = null;
    } else {
      const cid = Number(categoryId);
      if (!db.categories.some((c) => c.id === cid)) {
        return res.status(400).json({ error: "invalid categoryId" });
      }
      p.categoryId = cid;
    }
  }
  if (description != null) p.description = String(description);
  writeDb(db);
  res.json(p);
});

app.delete("/products/:id", (req, res) => {
  const db = readDb();
  const idx = db.products.findIndex((x) => String(x.id) === String(req.params.id));
  if (idx === -1) return res.status(404).json({ error: "not found" });
  const [removed] = db.products.splice(idx, 1);
  writeDb(db);
  res.json(removed);
});

// ---------- Orders CRUD (many orders -> one user; demonstrates "orders" in UI) ----------
app.get("/orders", (req, res) => {
  res.json(readDb().orders);
});

app.get("/orders/:id", (req, res) => {
  const o = readDb().orders.find((x) => String(x.id) === String(req.params.id));
  if (!o) return res.status(404).json({ error: "not found" });
  res.json(o);
});

app.post("/orders", (req, res) => {
  const db = readDb();
  const { userId, total, status } = req.body || {};
  const uid = userId != null ? Number(userId) : null;
  if (!uid || !db.users.some((u) => u.id === uid)) {
    return res.status(400).json({ error: "valid userId required" });
  }
  const row = {
    id: nextId(db.orders),
    userId: uid,
    total: total != null ? Number(total) : 0,
    status: status ? String(status) : "pending",
  };
  db.orders.push(row);
  writeDb(db);
  res.status(201).json(row);
});

app.put("/orders/:id", (req, res) => {
  const db = readDb();
  const o = db.orders.find((x) => String(x.id) === String(req.params.id));
  if (!o) return res.status(404).json({ error: "not found" });
  const { userId, total, status } = req.body || {};
  if (userId != null) {
    const uid = Number(userId);
    if (!db.users.some((u) => u.id === uid)) {
      return res.status(400).json({ error: "invalid userId" });
    }
    o.userId = uid;
  }
  if (total != null) o.total = Number(total);
  if (status != null) o.status = String(status);
  writeDb(db);
  res.json(o);
});

app.delete("/orders/:id", (req, res) => {
  const db = readDb();
  const idx = db.orders.findIndex((x) => String(x.id) === String(req.params.id));
  if (idx === -1) return res.status(404).json({ error: "not found" });
  const [removed] = db.orders.splice(idx, 1);
  writeDb(db);
  res.json(removed);
});

app.listen(PORT, () => {
  console.log(`API http://localhost:${PORT}`);
});
