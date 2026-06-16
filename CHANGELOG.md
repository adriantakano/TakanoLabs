# Changelog

Todas las modificaciones notables de este proyecto se documentan aquí.
El formato sigue [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/)
y el proyecto usa [Versionado Semántico](https://semver.org/lang/es/).

## [1.3.0] — 2026-06-12

### Added — Fase 4 (SEO y métricas)
- `src/pages/rss.xml.js` → feed RSS (`/rss.xml`) con enlaces absolutos y `es-MX`.
- `public/robots.txt` con referencia a `sitemap-index.xml` (sitemap ya generado por `@astrojs/sitemap`).
- Componente `JsonLd.astro` y datos estructurados:
  - **Global** (todas las páginas): `WebSite` + `Organization`.
  - **Artículo**: `Article` (datePublished=pubDate, dateModified=lastReviewed,
    author `Person`, publisher `Organization`) + `BreadcrumbList`.
  - **Categoría**: `BreadcrumbList`.
- **OG por categoría**: campo `ogImage` en el mapa canónico (`/images/og/{quimica,economia,social}.png`).
- `<meta name="theme-color">` y `<link rel="alternate" type="application/rss+xml">`.

### Notas
- Meta completos ya cubiertos desde Fase 2 (`SEOHead`): title, description, canonical,
  Open Graph con `og:image` absoluta, Twitter Card, `hreflang="es-MX"`, robots.
- Para el verde de Lighthouse faltan **activos del usuario** (fuentes, imágenes); ver README §8.

## [1.2.0] — 2026-06-12

### Added — Fase 3 (Editorial + dinámico)
- **Pages Functions:**
  - `functions/api/newsletter.js` — valida/normaliza email, honeypot, INSERT
    anti-duplicado (`ON CONFLICT DO NOTHING`) y confirmación Resend desde
    `notificaciones@adriantakano.com` (solo a suscriptores nuevos).
  - `functions/api/view.js` — UPSERT atómico de vistas con filtro de bots por User-Agent.
  - `functions/api/most-read.js` — top 5 por vistas, cacheado en edge (Cache API, TTL 10 min).
- **Migraciones D1:** `0003_newsletter_blog.sql` (`newsletter_blog_subscribers`),
  `0004_article_views.sql` (`article_views`).
- **Componentes:** `ShareButtons` (X/WhatsApp/LinkedIn/copiar), `RelatedArticles`,
  `NewsletterInline` (form + estados + honeypot, `id="newsletter"`),
  `CTAServiciosWeb` (→ `/web`), `MostRead` (fallback estático + manifiesto + island).
- **Conteo de vistas en cliente:** `POST /api/view` 1 vez por sesión/slug
  (guarda en `sessionStorage`) tras 5 s o 25 % de scroll.
- Integrados en `BlogPost` (share → related → newsletter → CTA), `CategoryPage` (CTA)
  y home (MostRead + newsletter).

### Pendiente del usuario
- **Aplicar migraciones a producción** (necesario para newsletter/vistas):
  `wrangler d1 migrations apply CalidadAlimentaria --remote`.
  Hasta entonces, las funciones responden sin romper la página.

## [1.1.0] — 2026-06-12

### Added — Fase 2 (Motor del blog)
- `src/config/categories.ts`: **mapa canónico** (única fuente de verdad) con helpers
  (`getCategory`, `getCategoryBySegment`, `getArticleUrl`, `getCategoryUrl`).
  Desacopla `section` (frontmatter) · `segment` (URL) · `name` · `color`.
- `src/config/site.ts`: configuración global del sitio.
- `src/content/config.ts`: colección `blog` validada con **zod** (loader `glob`).
- 3 artículos de arranque movidos a `src/content/blog/`.
- Estilos: `src/styles/global.css` (reset + `@font-face` + base) y `prose.css` (cuerpo serif).
- Layouts: `BaseLayout.astro`, `BlogPost.astro`, `CategoryPage.astro`.
- Componentes: `SEOHead`, `NavBar` (hamburguesa accesible con ARIA), `Footer`,
  `CategoryBadge`, `ArticleCard` (variantes large/small), `AuthorBlock`
  (LinkedIn condicional vía `authorLinkedin`), `ReadingTime`.
- Rutas: home editorial (`index.astro`), `/[categoria]/index.astro`,
  `/[categoria]/[slug].astro`, `404.astro`.
- `public/favicon.svg`.

### Validado
- URLs derivadas del mapa canónico: `quimica-vida → /quimica`,
  `economia-digital → /economia`, **`pulso-urbano → /social`** (no `/pulso-urbano`).
- Meta SEO por artículo: canonical, `hreflang="es-MX"`, Open Graph con `og:image`
  **absoluta**, Twitter Card. Build de 8 páginas OK; sitio de servicios intacto.

### Pendiente del usuario
- Descargar **Newsreader** (`newsreader-latin-regular/600/italic.woff2`) a `public/fonts/`
  (el cuerpo usa fallback serif hasta entonces; build no falla).

## [1.0.0] — 2026-06-12

### Added — Fase 1 (Fundación)
- Proyecto **Astro** inicializado con `output: 'static'` (SSG puro, sin adaptador SSR).
  Integración `@astrojs/sitemap`. `site = https://www.takanolabs.com`.
- `src/styles/tokens.css`: tokens de diseño (base dicromática B/N + colores de
  categoría del mapa canónico, tipografía, espaciado, layout).
- `src/pages/index.astro`: home **provisional** desplegable (la portada editorial
  completa llega en la Fase 2).
- Estructura `public/images/{authors,posts,og}/` para activos del blog.

### Changed
- **Sitio de servicios migrado a `/web`** (antes `/diseñoweb`):
  - `diseñoweb.html` → `public/web/index.html`
  - `contacto.html` → `public/contacto/index.html`
  - `servicioredes.html` → `public/servicioredes/index.html`
  - Activos (`css/`, `js/`, `img/`, `fonts/`) movidos a `public/` con **rutas
    absolutas** (`/css/…`, `/js/…`, `/img/…`, `/fonts/…`) y enlaces internos
    reescritos a `/web`, `/contacto`, `/servicioredes`.
- `wrangler.toml`: `pages_build_output_dir` cambiado de `src` a **`dist`** (salida de Astro).
- `.gitignore`: añadidos `.astro/`, `.wrangler/`, `.dev.vars`.

### Added — Redirecciones
- `public/_redirects`: **301** de `/diseñoweb`, `/dise%C3%B1oweb` y `/diseñoweb.html` → `/web`.

### Preserved (sin cambios de contrato)
- `functions/api/contacto.js` y la tabla `contactos` (formulario de servicios).
  El formulario sigue posteando a `POST /api/contacto`.

### Notas
- El antiguo `src/index.html` era un placeholder ("Blog — Próximamente"); queda
  reemplazado por la home de Astro.
- **Pendiente del usuario:** en el dashboard de Cloudflare Pages, fijar
  *Build command* = `npm run build` y *Output directory* = `dist` (ver README).
