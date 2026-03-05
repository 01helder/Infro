import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import Database from "better-sqlite3";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const JWT_SECRET = process.env.JWT_SECRET || "infomarket-secret-key-123";
const db = new Database("infomarket.db");

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT DEFAULT 'buyer', -- 'buyer', 'creator'
    balance REAL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    creator_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    price REAL NOT NULL,
    category TEXT NOT NULL,
    type TEXT NOT NULL, -- 'ebook', 'course', 'pdf', 'audio', 'video'
    cover_image TEXT,
    content_url TEXT,
    rating REAL DEFAULT 0,
    rating_count INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (creator_id) REFERENCES users (id)
  );

  CREATE TABLE IF NOT EXISTS sales (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL,
    buyer_id INTEGER NOT NULL,
    affiliate_id INTEGER,
    amount REAL NOT NULL,
    platform_fee REAL NOT NULL,
    creator_earnings REAL NOT NULL,
    affiliate_earnings REAL NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products (id),
    FOREIGN KEY (buyer_id) REFERENCES users (id),
    FOREIGN KEY (affiliate_id) REFERENCES users (id)
  );

  CREATE TABLE IF NOT EXISTS affiliates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    code TEXT UNIQUE NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, product_id),
    FOREIGN KEY (user_id) REFERENCES users (id),
    FOREIGN KEY (product_id) REFERENCES products (id)
  );

  CREATE TABLE IF NOT EXISTS library (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    purchased_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, product_id),
    FOREIGN KEY (user_id) REFERENCES users (id),
    FOREIGN KEY (product_id) REFERENCES products (id)
  );
`);

// Seed Data
const seed = () => {
  const userCount = db.prepare("SELECT COUNT(*) as count FROM users").get() as any;
  if (userCount.count === 0) {
    const hashedPassword = bcrypt.hashSync("password123", 10);
    
    // Create a creator
    const creatorId = db.prepare("INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)").run(
      "creator@example.com", hashedPassword, "John Creator", "creator"
    ).lastInsertRowid;

    // Create a buyer
    db.prepare("INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)").run(
      "buyer@example.com", hashedPassword, "Jane Buyer", "buyer"
    );

    // Create some products
    const products = [
      {
        title: "Mastering React 19",
        description: "The ultimate guide to the latest React features, including Server Components and Actions.",
        price: 49.99,
        category: "Tech",
        type: "course",
        cover_image: "https://picsum.photos/seed/react/800/450",
        content_url: "https://example.com/react-course"
      },
      {
        title: "Digital Marketing Secrets",
        description: "Learn how to scale your business using social media and SEO strategies.",
        price: 29.99,
        category: "Marketing",
        type: "ebook",
        cover_image: "https://picsum.photos/seed/marketing/800/450",
        content_url: "https://example.com/marketing-ebook"
      },
      {
        title: "UI/UX Design Masterclass",
        description: "From wireframes to high-fidelity prototypes. Learn Figma like a pro.",
        price: 79.99,
        category: "Design",
        type: "video",
        cover_image: "https://picsum.photos/seed/design/800/450",
        content_url: "https://example.com/design-video"
      },
      {
        title: "Financial Freedom Guide",
        description: "A comprehensive PDF guide on investing and managing your personal finances.",
        price: 19.99,
        category: "Finance",
        type: "pdf",
        cover_image: "https://picsum.photos/seed/finance/800/450",
        content_url: "https://example.com/finance-pdf"
      }
    ];

    const insertProduct = db.prepare(`
      INSERT INTO products (creator_id, title, description, price, category, type, cover_image, content_url)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const p of products) {
      insertProduct.run(creatorId, p.title, p.description, p.price, p.category, p.type, p.cover_image, p.content_url);
    }
  }
};

seed();

const app = express();
app.use(express.json());

// Auth Middleware
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: "Unauthorized" });

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.status(403).json({ error: "Forbidden" });
    req.user = user;
    next();
  });
};

// --- API Routes ---

// Auth
app.post("/api/auth/signup", async (req, res) => {
  const { email, password, name, role } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = db.prepare("INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)").run(email, hashedPassword, name, role || 'buyer');
    const token = jwt.sign({ id: result.lastInsertRowid, email, role: role || 'buyer' }, JWT_SECRET);
    res.json({ token, user: { id: result.lastInsertRowid, email, name, role: role || 'buyer', balance: 0 } });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  const user: any = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ error: "Invalid credentials" });
  }
  const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET);
  res.json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role, balance: user.balance } });
});

app.get("/api/auth/me", authenticateToken, (req: any, res) => {
  const user: any = db.prepare("SELECT id, email, name, role, balance FROM users WHERE id = ?").get(req.user.id);
  res.json(user);
});

// Products
app.get("/api/products", (req, res) => {
  const products = db.prepare(`
    SELECT p.*, u.name as creator_name 
    FROM products p 
    JOIN users u ON p.creator_id = u.id 
    ORDER BY p.created_at DESC
  `).all();
  res.json(products);
});

app.get("/api/products/:id", (req, res) => {
  const product = db.prepare(`
    SELECT p.*, u.name as creator_name 
    FROM products p 
    JOIN users u ON p.creator_id = u.id 
    WHERE p.id = ?
  `).get(req.params.id);
  if (!product) return res.status(404).json({ error: "Product not found" });
  res.json(product);
});

app.post("/api/products", authenticateToken, (req: any, res) => {
  const { title, description, price, category, type, cover_image, content_url } = req.body;
  const result = db.prepare(`
    INSERT INTO products (creator_id, title, description, price, category, type, cover_image, content_url)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(req.user.id, title, description, price, category, type, cover_image, content_url);
  res.json({ id: result.lastInsertRowid });
});

// Affiliates
app.post("/api/affiliates/join/:productId", authenticateToken, (req: any, res) => {
  const productId = req.params.productId;
  const code = Math.random().toString(36).substring(2, 10).toUpperCase();
  try {
    db.prepare("INSERT INTO affiliates (user_id, product_id, code) VALUES (?, ?, ?)").run(req.user.id, productId, code);
    res.json({ code });
  } catch (e: any) {
    const existing = db.prepare("SELECT code FROM affiliates WHERE user_id = ? AND product_id = ?").get(req.user.id, productId);
    res.json(existing);
  }
});

app.get("/api/affiliates/my-links", authenticateToken, (req: any, res) => {
  const links = db.prepare(`
    SELECT a.code, p.title, p.price, p.id as product_id
    FROM affiliates a
    JOIN products p ON a.product_id = p.id
    WHERE a.user_id = ?
  `).all(req.user.id);
  res.json(links);
});

// Sales / Checkout
app.post("/api/checkout", authenticateToken, (req: any, res) => {
  const { productId, affiliateCode } = req.body;
  const product: any = db.prepare("SELECT * FROM products WHERE id = ?").get(productId);
  if (!product) return res.status(404).json({ error: "Product not found" });

  let affiliate: any = null;
  if (affiliateCode) {
    affiliate = db.prepare("SELECT * FROM affiliates WHERE code = ?").get(affiliateCode);
  }

  const amount = product.price;
  const platformFee = amount * 0.10;
  let affiliateEarnings = 0;
  
  if (affiliate) {
    // Assume 50% affiliate commission for simplicity
    affiliateEarnings = (amount - platformFee) * 0.50;
  }
  
  const creatorEarnings = amount - platformFee - affiliateEarnings;

  db.transaction(() => {
    // Record sale
    db.prepare(`
      INSERT INTO sales (product_id, buyer_id, affiliate_id, amount, platform_fee, creator_earnings, affiliate_earnings)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(productId, req.user.id, affiliate?.user_id || null, amount, platformFee, creatorEarnings, affiliateEarnings);

    // Add to library
    db.prepare("INSERT OR IGNORE INTO library (user_id, product_id) VALUES (?, ?)").run(req.user.id, productId);

    // Update creator balance
    db.prepare("UPDATE users SET balance = balance + ? WHERE id = ?").run(creatorEarnings, product.creator_id);

    // Update affiliate balance
    if (affiliate) {
      db.prepare("UPDATE users SET balance = balance + ? WHERE id = ?").run(affiliateEarnings, affiliate.user_id);
    }
  })();

  res.json({ success: true });
});

// Library
app.get("/api/library", authenticateToken, (req: any, res) => {
  const products = db.prepare(`
    SELECT p.*, u.name as creator_name
    FROM library l
    JOIN products p ON l.product_id = p.id
    JOIN users u ON p.creator_id = u.id
    WHERE l.user_id = ?
  `).all(req.user.id);
  res.json(products);
});

// Creator Stats
app.get("/api/creator/stats", authenticateToken, (req: any, res) => {
  const stats = db.prepare(`
    SELECT 
      COUNT(s.id) as total_sales,
      SUM(s.amount) as total_revenue,
      SUM(s.creator_earnings) as net_earnings
    FROM sales s
    JOIN products p ON s.product_id = p.id
    WHERE p.creator_id = ?
  `).get(req.user.id);
  
  const products = db.prepare("SELECT * FROM products WHERE creator_id = ?").all(req.user.id);
  
  res.json({ stats, products });
});

// --- Vite Setup ---
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  const PORT = 3000;
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
