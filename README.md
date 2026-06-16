# Takano Labs — Blog + Sitio de Servicios

Blog profesional (Astro SSG) en `https://www.takanolabs.com`, dirigido a público
mexicano joven y audiencia regiomontana. Prioridad: **SEO + rendimiento**, mobile-first.
El sitio de servicios de diseño web convive como **estático independiente** bajo `/web`.

- **Stack:** Astro `output: 'static'` · Cloudflare Pages · Pages Functions · D1 · Resend
- **Contenido:** artículos en `.md` (Content Collections + zod). **Nunca** en base de datos.
- **Dinámico** (Pages Functions en `functions/api/`): contacto, newsletter, vistas.

---

## 1. Desarrollo local

```bash
npm install
npm run dev        # http://localhost:4321  (solo el blog Astro)
npm run build      # genera dist/
npm run preview    # sirve dist/ localmente
```

> El sitio de servicios (`/web`, `/contacto`, `/servicioredes`) son archivos estáticos
> en `public/`; Astro los copia tal cual a `dist/` sin procesarlos.

### Probar las Pages Functions + D1 localmente
```bash
npx wrangler pages dev dist --d1 DB=CalidadAlimentaria
```

---

## 2. Despliegue (Cloudflare Pages)

El deploy es automático desde GitHub. **Tras esta migración a Astro**, hay que ajustar
una sola vez la configuración de build en el **dashboard de Cloudflare Pages**
(Settings → Builds & deployments):

| Ajuste | Valor |
| --- | --- |
| Framework preset | **Astro** |
| Build command | **`npm run build`** |
| Build output directory | **`dist`** |
| Root directory | *(vacío / raíz del repo)* |

> Antes el proyecto servía `src/` como estático sin build. Ahora Astro compila a `dist/`
> (ya reflejado en `wrangler.toml` → `pages_build_output_dir = "dist"`).

### Variables de entorno / secretos (Pages → Settings → Environment variables)
| Nombre | Uso |
| --- | --- |
| `RESEND_API_KEY` | Correos de contacto y, en Fase 3, confirmación de newsletter. Ya configurada. |

---

## 3. Base de datos D1

- **Binding:** `DB` → base **`CalidadAlimentaria`** (`id 09086825-…`), definido en `wrangler.toml`.
- **Tablas:**
  - `contactos` — formulario de servicios (existente, **no se toca**). Migración `0001_contactos.sql`.
  - `newsletter_blog_subscribers` — suscriptores del blog *(Fase 3 — migración `0003`)*.
  - `article_views` — contador de vistas por artículo *(Fase 3 — migración `0004`)*.

Aplicar migraciones a **producción**:
```bash
npx wrangler d1 migrations apply CalidadAlimentaria --remote
```

---

## 4. Rutas y redirecciones

| Ruta | Qué sirve |
| --- | --- |
| `/` | Home del blog (Astro) |
| `/quimica`, `/economia`, `/social` | Secciones del blog *(Fase 2)* |
| `/web` | Landing de servicios (estático, independiente) |
| `/contacto` | Formulario de servicios (estático + `POST /api/contacto`) |
| `/servicioredes` | Servicio de redes (estático) |

**301** en `public/_redirects`: `/diseñoweb`, `/dise%C3%B1oweb`, `/diseñoweb.html` → `/web`.

> Mapa canónico de categorías (única fuente de verdad en `src/config/categories.ts`, Fase 2):
> `quimica-vida → /quimica` (#407C16) · `economia-digital → /economia` (#1F54B5) ·
> `pulso-urbano → /social` (#A917CF). La URL **nunca** se amarra al nombre de carpeta del `.md`.

---

## 5. Tipografía — fuentes a descargar

Estrategia de carga (fija): `preload` de las críticas · `font-display: swap` ·
subset **latin** por `unicode-range` · `size-adjust`/`ascent-override` para minimizar CLS.

Las `.woff2` viven en **`public/fonts/`**.

### Ya están en el repo (no descargar)
| Familia | Pesos | Archivo |
| --- | --- | --- |
| Space Grotesk *(titulares/UI)* | 500, 700 | `space-grotesk-v16-latin-500.woff2`, `space-grotesk-v16-latin-700.woff2` |
| JetBrains Mono *(etiquetas/fechas/kicker)* | 400 | `jetbrains-mono-v18-latin-regular.woff2` |

### ⬇️ Descargar e instalar en `public/fonts/` — **Newsreader** (cuerpo del artículo)

Fuente diseñada para lectura larga en pantalla. Descárgala desde
**google-webfonts-helper** (`https://gwfh.mranftl.com/fonts/newsreader`), subset
**latin**, formato **woff2**, estos 3 estilos:

| Estilo | Peso | Italic | Archivo esperado |
| --- | --- | --- | --- |
| Regular | 400 | no | `newsreader-vXX-latin-regular.woff2` |
| SemiBold | 600 | no | `newsreader-vXX-latin-600.woff2` |
| Italic | 400 | sí | `newsreader-vXX-latin-italic.woff2` |

> `vXX` es el número de versión que asigne google-webfonts-helper (p. ej. `v22`).
> Si los nombres difieren, avísame y ajusto las `@font-face` en la Fase 2.

Alternativa: Google Fonts → `https://fonts.google.com/specimen/Newsreader`
(selecciona Regular 400, Italic 400, SemiBold 600).

**Pareja tipográfica final del blog:**
`Space Grotesk` (titulares/UI, fuerte) + `Newsreader` (cuerpo, serif legible) +
`JetBrains Mono` (kicker/fechas/etiquetas).

---

## 6. Convención del bloque de autor en el `.md`

El autor es **texto libre** en el frontmatter (sin registro ni `authorId`). Campos:

```yaml
author: "Adrián Takano"
authorRole: "Químico Clínico | Especialista en IA Aplicada"
authorImage: "/images/authors/adrian-takano.webp"   # opcional → fallback default.webp
authorLinkedin: "https://www.linkedin.com/in/adrian-takano"  # opcional
```

Reglas que aplica `AuthorBlock.astro` *(Fase 2)*:
- Avatares en **`public/images/authors/`**, `.webp` cuadrado 256×256, < 30 KB.
- Si falta `authorImage` → usa `/images/authors/default.webp` (el build **no** falla).
- El icono de LinkedIn se muestra **solo si** `authorLinkedin` existe y no está vacío;
  el enlace abre en pestaña nueva (`target="_blank" rel="noopener noreferrer"`).
- La clave del frontmatter es **`authorLinkedin`** (con "in" minúscula).

> Tú analizas/editas cada `.md` manualmente y subes por git; Cloudflare recompila.

---

## 7. Estado por fases

- [x] **Fase 1 — Fundación**: Astro inicializado y desplegable; servicios → `/web` con 301.
- [x] **Fase 2 — Motor del blog**: `categories.ts`, Content Collections, rutas
  `/[categoria]` y `/[categoria]/[slug]`, layouts, NavBar, SEOHead, AuthorBlock, etc.
- [x] **Fase 3 — Editorial + dinámico**: ShareButtons, RelatedArticles, NewsletterInline,
  MostRead, CTAServiciosWeb; funciones `newsletter.js`/`view.js`/`most-read.js`;
  migraciones `0003`/`0004`; Resend; conteo de vistas.
- [x] **Fase 4 — SEO y métricas**: `rss.xml`, `robots.txt`, sitemap, OG por categoría,
  JSON-LD (`Article`, `BreadcrumbList`, `WebSite`/`Organization`). Lighthouse: pendiente
  de validar tras subir activos (§8).

---

## 8. Archivos que debes subir (para el verde de Lighthouse)

El código está completo; estas rutas se referencian pero los binarios los subes tú.
Mientras falten, el sitio **no se rompe** (fuentes con fallback, imágenes con espacio reservado).

### Fuentes → `public/fonts/`  ✅ ya subidas
- `newsreader-v26-latin-regular.woff2`
- `newsreader-v26-latin-600.woff2`
- `newsreader-v26-latin-italic.woff2`
> De `https://gwfh.mranftl.com/fonts/newsreader` (subset latin, woff2). Las `@font-face` en `global.css` apuntan a estos nombres `-v26-`.

### Avatares → `public/images/authors/`
- `adrian-takano.webp`
- `default.webp`  *(fallback obligatorio)*
> Cuadrado 256×256, `.webp`, < 30 KB.

### Imágenes hero de los artículos → `public/images/posts/`
- `ia-empleos-mexico.webp`
- `nearshoring-nl.webp`
- `sin-takis-en-la-cooperativa.webp`
> Recomendado 1200×675 (16:9), `.webp`.

### Imágenes Open Graph → `public/images/og/`
- `ia-empleos-mexico.png` · `nearshoring-nl.png` · `sin-takis-en-la-cooperativa.png`  *(por artículo)*
- `quimica.png` · `economia.png` · `social.png`  *(por categoría)*
- `default.png`  *(fallback global)*
> Recomendado 1200×630, `.png` o `.jpg`.

> El logo (`/img/Logo1.webp`) y el favicon (`/favicon.svg`) ya están en el repo.

---

## 9. Checklist de puesta en producción

> **Dónde se despliega:** en el proyecto **Pages existente `takanolabs`** (ya conectado al
> repo GitHub `adriantakano/TakanoLabs` y al dominio `takanolabs.com`). **No** se crea un
> Worker ni un proyecto nuevo: Pages aloja el blog (build de Astro) + las Pages Functions
> (`functions/`) + el binding D1, todo en el mismo proyecto.

**Configuración única en el dashboard (proyecto `takanolabs`):**
- [ ] **Settings → Builds & deployments → Build configurations:**
      Framework preset `Astro` · Build command `npm run build` · Output directory `dist` · Root *(vacío)*.
- [ ] **Settings → Functions → D1 database bindings:** variable `DB` → base `CalidadAlimentaria`.
- [ ] **Settings → Environment variables:** `RESEND_API_KEY` presente.

**Cada despliegue:**
1. [ ] `npm run build` local (verifica que compila).
2. [ ] Subir los activos del §8 (imágenes + fuentes) con nombres exactos en minúsculas.
3. [ ] Aplicar migraciones D1 (una vez, desde tu máquina):
       `npx wrangler d1 migrations apply CalidadAlimentaria --remote`
4. [ ] `git push` → Cloudflare compila y despliega automático. Si el build falla,
       el deploy anterior **sigue vivo** (no te quedas sin sitio).

**Verificación post-deploy:**
- [ ] `/diseñoweb` y `/dise%C3%B1oweb` redirigen **301** a `/web`.
- [ ] Formulario de `/contacto` envía correctamente (Pages Function intacta).
- [ ] Las 3 URLs salen bien, en especial `pulso-urbano → /social/...`.
- [ ] No hay imágenes rotas (si las hay, casi siempre es **mayúsculas/minúsculas** en el nombre).
- [ ] Newsletter y contador de vistas responden (requieren las migraciones del paso 3).
- [ ] Lighthouse (móvil y escritorio) ≥ 95 en Performance, SEO, Accessibility y Best Practices.
