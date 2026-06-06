import Database from "better-sqlite3";

import fs from "node:fs";
import path from "node:path";

const DB_PATH = path.resolve(process.cwd(), ".data/cgi.db");

let db: Database.Database | null = null;

function ensureDbDir(): void {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function runMigrations(database: Database.Database): void {
  database.exec(`
    CREATE TABLE IF NOT EXISTS upload_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      filename TEXT NOT NULL,
      rows_imported INTEGER NOT NULL,
      rows_ignored INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

export function createPedidosTable(columns: string[]): void {
  const database = getDb();
  const colDefs = columns.map((col) => `"${col}" TEXT`).join(",\n    ");
  const sql = `
    CREATE TABLE IF NOT EXISTS pedidos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ${colDefs},
      mes_competencia TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(id_contacto, mes_competencia)
    )
  `;
  database.exec(sql);
}

export function insertUploadHistory(filename: string, rowsImported: number, rowsIgnored: number): void {
  const database = getDb();
  const stmt = database.prepare("INSERT INTO upload_history (filename, rows_imported, rows_ignored) VALUES (?, ?, ?)");
  stmt.run(filename, rowsImported, rowsIgnored);
}

export function getDb(): Database.Database {
  if (!db) {
    ensureDbDir();
    db = new Database(DB_PATH);
    db.pragma("journal_mode = WAL");
    runMigrations(db);
  }
  return db;
}
