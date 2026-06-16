-- Contador de vistas por artículo. slug = PRIMARY KEY (habilita el UPSERT atómico).
-- Aplicar a producción:  wrangler d1 migrations apply CalidadAlimentaria --remote
CREATE TABLE IF NOT EXISTS article_views (
    slug       TEXT PRIMARY KEY,       -- identificador del artículo
    section    TEXT NOT NULL,          -- sección canónica (quimica-vida | economia-digital | pulso-urbano)
    views      INTEGER DEFAULT 0,      -- visitas acumuladas
    updated_at TEXT                    -- ISO 8601 del último incremento
);
