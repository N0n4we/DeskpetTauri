import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import db, { save } from "./db.js";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || "deskpet-dev-secret-change-me";
const JWT_EXPIRES = "7d";

function signToken(userId) {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES });
}

router.post("/api/register", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ error: "username and password required" });
  if (username.length < 2 || username.length > 32)
    return res.status(400).json({ error: "username must be 2-32 chars" });
  if (password.length < 6)
    return res.status(400).json({ error: "password must be at least 6 chars" });

  const hash = bcrypt.hashSync(password, 10);
  try {
    // Check if username already exists
    const existing = db.exec("SELECT id FROM users WHERE username = ?", [username]);
    if (existing.length > 0 && existing[0].values.length > 0)
      return res.status(409).json({ error: "username already exists" });

    db.run("INSERT INTO users (username, password_hash) VALUES (?, ?)", [username, hash]);
    const result = db.exec("SELECT last_insert_rowid() as id");
    const userId = result[0].values[0][0];
    save();
    res.json({ token: signToken(userId) });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post("/api/login", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ error: "username and password required" });

  const rows = db.exec("SELECT id, password_hash FROM users WHERE username = ?", [username]);
  if (!rows.length || !rows[0].values.length)
    return res.status(401).json({ error: "invalid username or password" });

  const [id, passwordHash] = rows[0].values[0];
  if (!bcrypt.compareSync(password, passwordHash))
    return res.status(401).json({ error: "invalid username or password" });

  res.json({ token: signToken(id) });
});

export function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer "))
    return res.status(401).json({ error: "token required" });

  try {
    const decoded = jwt.verify(header.slice(7), JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch {
    res.status(401).json({ error: "invalid or expired token" });
  }
}

export default router;
