-- Suscriptores del newsletter del BLOG (exclusiva; sin relación con `contactos`).
-- Aplicar a producción:  wrangler d1 migrations apply CalidadAlimentaria --remote
CREATE TABLE IF NOT EXISTS newsletter_blog_subscribers (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    email      TEXT UNIQUE NOT NULL,   -- 2ª línea de defensa anti-duplicado
    created_at TEXT,                   -- ISO 8601, p. ej. 2026-06-12T14:32:00Z
    source     TEXT,                   -- slug del artículo de origen
    active     INTEGER DEFAULT 1       -- 1 = activo, 0 = baja (nunca borrar filas)
);
