/* =============================================================
   Colección `blog` — Content Collections + zod (validado en build).
   Los artículos son .md en src/content/blog/. NUNCA en base de datos.
   La URL se deriva de section (frontmatter) -> segment vía categories.ts;
   NO del nombre de archivo.
   ============================================================= */
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    slug: z.string(),

    // Sección canónica (clave del mapa de categorías).
    section: z.enum(['quimica-vida', 'economia-digital', 'pulso-urbano']),
    category: z.string(),
    tags: z.array(z.string()).default([]),

    pubDate: z.coerce.date(),
    draft: z.boolean().default(false),

    // Autor: texto libre + avatar (sin registro ni authorId).
    author: z.string(),
    authorRole: z.string(),
    authorImage: z.string().optional(),           // fallback -> default.webp
    authorLinkedin: z.string().url().optional(),  // clave con "in" minúscula

    keywords: z.array(z.string()).default([]),

    heroImage: z.string(),
    heroImageAlt: z.string(),
    ogImage: z.string(),
    canonicalURL: z.string().default(''),          // vacío -> URL propia

    readingTime: z.number().optional(),            // lo fija el autor a mano
    featured: z.boolean().default(false),
    series: z.string().default(''),

    lastReviewed: z.coerce.date(),
    sourcesCount: z.number().default(0),
  }),
});

export const collections = { blog };
