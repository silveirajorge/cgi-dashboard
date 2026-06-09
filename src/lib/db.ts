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

  database.exec(`
    CREATE TABLE IF NOT EXISTS carteira_clientes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      mes_competencia TEXT NOT NULL UNIQUE,
      total_clientes INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Índice em CIL para performance de queries CIL
  try {
    database.exec(`CREATE INDEX IF NOT EXISTS idx_pedidos_cil ON pedidos(cil)`);
  } catch {
    // Tabela pedidos pode não existir ainda (criada dinamicamente no upload)
  }

  database.exec(`
    CREATE TABLE IF NOT EXISTS funcionarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      ativo INTEGER NOT NULL DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  database.exec(`
    CREATE TABLE IF NOT EXISTS avaliacoes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      funcionario_id INTEGER NOT NULL,
      data_avaliacao TEXT NOT NULL,
      pontualidade INTEGER NOT NULL CHECK(pontualidade >= 1 AND pontualidade <= 10),
      qualidade INTEGER NOT NULL CHECK(qualidade >= 1 AND qualidade <= 10),
      trabalho_equipa INTEGER NOT NULL CHECK(trabalho_equipa >= 1 AND trabalho_equipa <= 10),
      iniciativa INTEGER NOT NULL CHECK(iniciativa >= 1 AND iniciativa <= 10),
      comunicacao INTEGER NOT NULL CHECK(comunicacao >= 1 AND comunicacao <= 10),
      media REAL GENERATED ALWAYS AS (
        (pontualidade + qualidade + trabalho_equipa + iniciativa + comunicacao) / 5.0
      ) STORED,
      comentario TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (funcionario_id) REFERENCES funcionarios(id)
    )
  `);

  // Migração: remover coluna produtividade (1-10) e recriar media com 5 categorias
  try {
    database.exec("ALTER TABLE avaliacoes DROP COLUMN produtividade");
  } catch {
    // Coluna já foi removida
  }

  // Recriar media caso tenha sido dropada junto com produtividade
  try {
    database.exec(`
      ALTER TABLE avaliacoes ADD COLUMN media REAL GENERATED ALWAYS AS (
        (pontualidade + qualidade + trabalho_equipa + iniciativa + comunicacao) / 5.0
      ) STORED
    `);
  } catch {
    // Coluna media já existe
  }

  // Migração: adicionar colunas de auditoria à tabela avaliacoes
  const auditoriaColumns = [
    `ALTER TABLE avaliacoes ADD COLUMN atraso INTEGER NOT NULL DEFAULT 0`,
    `ALTER TABLE avaliacoes ADD COLUMN falta INTEGER NOT NULL DEFAULT 0`,
    `ALTER TABLE avaliacoes ADD COLUMN uso_ferramenta INTEGER NOT NULL DEFAULT 0`,
    `ALTER TABLE avaliacoes ADD COLUMN erro_critico INTEGER NOT NULL DEFAULT 0`,
    `ALTER TABLE avaliacoes ADD COLUMN perc_produtividade REAL`,
    `ALTER TABLE avaliacoes ADD COLUMN nota_auditoria REAL`,
    `ALTER TABLE avaliacoes ADD COLUMN tipo_auditoria TEXT CHECK(tipo_auditoria IN ('supervisor', 'auditor'))`,
  ];

  for (const sql of auditoriaColumns) {
    try {
      database.exec(sql);
    } catch {
      // Coluna já existe — migration idempotente
    }
  }
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
