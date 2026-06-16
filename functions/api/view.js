/* =============================================================
   TakanoLabs — POST /api/view  { slug, section }
   UPSERT atómico del contador de vistas. Filtra bots por User-Agent.
   ============================================================= */

const CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
};

// Patrones de User-Agent de bots/crawlers conocidos.
const BOT_RE = /bot|crawl|spider|slurp|bingpreview|facebookexternalhit|embedly|quora|pinterest|vkshare|w3c_validator|whatsapp|telegrambot|discordbot|googlebot|applebot|semrush|ahrefs|mj12bot|dotbot|petalbot|headless|lighthouse|gtmetrix|pagespeed/i;

export async function onRequestOptions() {
    return new Response(null, { status: 204, headers: CORS });
}

export async function onRequestPost({ request, env }) {
    try {
        const ua = request.headers.get('user-agent') || '';
        if (BOT_RE.test(ua)) {
            // Bot detectado: respondemos ok sin contar.
            return Response.json({ ok: true, counted: false }, { status: 200, headers: CORS });
        }

        const body = await request.json().catch(() => ({}));
        const slug = String(body.slug || '').trim().slice(0, 200);
        const section = String(body.section || '').trim().slice(0, 60);

        if (!slug) {
            return Response.json({ error: 'slug requerido.' }, { status: 400, headers: CORS });
        }

        const now = new Date().toISOString();

        // D1 es serializado: el UPSERT es atómico, sin condición de carrera.
        await env.DB
            .prepare(
                `INSERT INTO article_views (slug, section, views, updated_at)
                 VALUES (?, ?, 1, ?)
                 ON CONFLICT(slug) DO UPDATE SET
                   views = views + 1,
                   updated_at = excluded.updated_at`,
            )
            .bind(slug, section, now)
            .run();

        return Response.json({ ok: true, counted: true }, { status: 200, headers: CORS });
    } catch (err) {
        console.error('[view]', err?.message ?? err);
        return Response.json({ error: 'Error interno del servidor.' }, { status: 500, headers: CORS });
    }
}
