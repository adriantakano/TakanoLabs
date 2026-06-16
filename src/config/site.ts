/* =============================================================
   Configuración global del sitio (datos no editoriales).
   ============================================================= */
export const SITE = {
  name: 'Takano Labs',
  shortName: 'Takano Labs',
  url: 'https://www.takanolabs.com',
  lang: 'es-MX',
  locale: 'es_MX',
  description:
    'Ciencia, tecnología y sociedad explicadas para México. Química & Vida, Economía Digital y Pulso Urbano.',
  author: 'Adrián Takano',

  /** Activos por defecto (fallbacks para no romper diseño/SEO). */
  defaultOgImage: '/images/og/default.png',
  defaultAuthorImage: '/images/authors/default.webp',
  logo: '/img/Logo1.webp',

  /** Enlaces sociales / externos. */
  linkedin: 'https://www.linkedin.com/in/adrian-takano',

  /** Ruta del sitio de servicios (independiente del blog). */
  servicesUrl: '/web',
} as const;

export type SiteConfig = typeof SITE;
