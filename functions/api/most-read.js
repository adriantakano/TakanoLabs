/* =============================================================
   TakanoLabs — GET /api/most-read
   Top 5 artículos por vistas. Cacheado en el edge (Cache API, TTL ~10 min).
   ============================================================= */

const TTL = 600; // segundos

export async function onRequestGet({ request, env }) {
    const cache = caches.default;
    // Clave de caché estable (ignora query/sufijos): la misma para todos.
    const cacheKey = new Request(new URL('/api/most-read', request.url).toString(), {
        method: 'GET',
    });

    const cached = await cache.match(cacheKey);
    if (cached) return cached;

    try {
        const { results } = await env.DB
            .prepare(
                `SELECT slug, section, views
                 FROM article_views
                 ORDER BY views DESC
                 LIMIT 5`,
            )
            .all();

        const response = Response.json(
            { items: results ?? [] },
            {
                status: 200,
                headers: {
                    'Content-Type': 'application/json',
                    'Cache-Control': `public, max-age=${TTL}, s-maxage=${TTL}`,
                },
            },
        );

        // Guardar en el edge (no bloquea la respuesta al cliente).
        await cache.put(cacheKey, response.clone());
        return response;
    } catch (err) {
        console.error('[most-read]', err?.message ?? err);
        return Response.json({ items: [] }, { status: 200 });
    }
}
