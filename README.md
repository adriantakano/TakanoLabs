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
npm run dev        
npm run build      
npm run preview    
```



## 2. Rutas y redirecciones

| Ruta | Qué sirve |
| --- | --- |
| `/` | Home del blog (Astro) |
| `/quimica`, `/economia`, `/social` | Secciones del blog *(Fase 2)* |
| `/web` | Landing de servicios (estático, independiente) |
| `/contacto` | Formulario de servicios (estático + `POST /api/contacto`) |
| `/servicioredes` | Servicio de redes (estático) |



> Mapa canónico de categorías (única fuente de verdad en `src/config/categories.ts`, Fase 2):
> `quimica-vida → /quimica`  · `economia-digital → /economia`  ·
> `pulso-urbano → /social` . La URL **nunca** se amarra al nombre de carpeta del `.md`.

---

## 3. Tipografía — fuentes a descargar

Estrategia de carga (fija): `preload` de las críticas · `font-display: swap` ·
subset **latin** por `unicode-range` · `size-adjust`/`ascent-override` para minimizar CLS.

Las `.woff2` viven en **`public/fonts/`**.


| Familia | Pesos | Archivo |
| --- | --- | --- |
| Space Grotesk *(titulares/UI)* | 500, 700 | `space-grotesk-v16-latin-500.woff2`, `space-grotesk-v16-latin-700.woff2` |
| JetBrains Mono *(etiquetas/fechas/kicker)* | 400 | `jetbrains-mono-v18-latin-regular.woff2` |



Fuente diseñada para lectura larga en pantalla. 
**google-webfonts-helper** (`https://gwfh.mranftl.com/fonts/newsreader`), subset
**latin**, formato **woff2**, estos 3 estilos:

| Estilo | Peso | Italic | Archivo esperado |
| --- | --- | --- | --- |
| Regular | 400 | no | `newsreader-vXX-latin-regular.woff2` |
| SemiBold | 600 | no | `newsreader-vXX-latin-600.woff2` |
| Italic | 400 | sí | `newsreader-vXX-latin-italic.woff2` |




