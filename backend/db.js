import initSqlJs from "sql.js";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_PATH = join(__dirname, "data.db");

const SQL = await initSqlJs();
const buf = existsSync(DB_PATH) ? readFileSync(DB_PATH) : undefined;
const db = new SQL.Database(buf);

db.run(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now'))
  )
`);

db.run(`CREATE INDEX IF NOT EXISTS idx_users_username ON users(username)`);

export function save() {
  writeFileSync(DB_PATH, Buffer.from(db.export()));
}

save();

export default db;
