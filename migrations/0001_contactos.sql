CREATE TABLE IF NOT EXISTS contactos (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre       TEXT    NOT NULL,
    correo       TEXT    NOT NULL,
    giro_empresa TEXT,
    descripcion  TEXT    NOT NULL,
    creado_en    DATETIME NOT NULL DEFAULT (datetime('now'))
);
