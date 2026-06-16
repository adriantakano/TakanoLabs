/* =============================================================
   MAPA CANÓNICO DE CATEGORÍAS — única fuente de verdad.
   Tres nombres por categoría, deliberadamente desacoplados:
     · section  -> slug del frontmatter de los .md
     · segment  -> segmento de URL (¡puede diferir del section!)
     · name     -> nombre visible
     · color    -> color de marca (badge / enlace de menú)

   Regla crítica: la URL de un artículo es /{segment}/{slug},
   derivada SIEMPRE de este mapa (nunca del nombre de carpeta).
   En particular: pulso-urbano -> /social  (NO /pulso-urbano).
   ============================================================= */

export interface CategoryDef {
  /** slug usado en el frontmatter `section` */
  section: string;
  /** segmento que aparece en la URL */
  segment: string;
  /** nombre visible (menú, badges, breadcrumbs) */
  name: string;
  /** color de marca HEX */
  color: string;
  /** descripción corta (meta / cabecera de categoría) */
  description: string;
  /** imagen Open Graph de la categoría (ruta absoluta del sitio) */
  ogImage: string;
}

export const CATEGORIES = {
  'quimica-vida': {
    section: 'quimica-vida',
    segment: 'quimica',
    name: 'Química & Vida',
    color: '#407C16',
    description:
      'Ciencia, salud y alimentación explicadas con evidencia para tu vida diaria.',
    ogImage: '/images/og/quimica.png',
  },
  'economia-digital': {
    section: 'economia-digital',
    segment: 'economia',
    name: 'Economía Digital',
    color: '#1F54B5',
    description:
      'Tecnología, inteligencia artificial y el futuro del trabajo en México.',
    ogImage: '/images/og/economia.png',
  },
  'pulso-urbano': {
    section: 'pulso-urbano',
    segment: 'social',
    name: 'Pulso Urbano',
    color: '#A917CF',
    description:
      'Sociedad, ciudad y economía regional: lo que mueve a Nuevo León y México.',
    ogImage: '/images/og/social.png',
  },
} as const satisfies Record<string, CategoryDef>;

/** slug de section válido (clave del frontmatter) */
export type Section = keyof typeof CATEGORIES;

/** Lista ordenada para menús y rejillas. */
export const CATEGORY_LIST: CategoryDef[] = Object.values(CATEGORIES);

/** section -> definición. */
export function getCategory(section: string): CategoryDef | undefined {
  return (CATEGORIES as Record<string, CategoryDef>)[section];
}

/** Mapa inverso segment -> definición (para resolver rutas /[categoria]). */
const BY_SEGMENT: Record<string, CategoryDef> = Object.fromEntries(
  CATEGORY_LIST.map((c) => [c.segment, c]),
);

/** segmento de URL -> definición. */
export function getCategoryBySegment(segment: string): CategoryDef | undefined {
  return BY_SEGMENT[segment];
}

/** URL de la página de categoría, p. ej. /social */
export function getCategoryUrl(section: string): string {
  const c = getCategory(section);
  return c ? `/${c.segment}` : '/';
}

/** URL de un artículo, traduciendo section -> segment. */
export function getArticleUrl(section: string, slug: string): string {
  const c = getCategory(section);
  return c ? `/${c.segment}/${slug}` : `/${slug}`;
}
