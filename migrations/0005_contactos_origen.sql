-- Añade columna `origen` a `contactos` para distinguir de qué sitio llegó el contacto.
-- Valores: 'takanolabs' (formulario de takanolabs.com/web) · 'adriantakano' (sitio adriantakano.com).
-- Las filas previas (origen mezclado, no rastreable) quedan como 'desconocido'.
-- Aplicar a producción:  wrangler d1 migrations apply CalidadAlimentaria --remote
ALTER TABLE contactos ADD COLUMN origen TEXT DEFAULT 'desconocido';
