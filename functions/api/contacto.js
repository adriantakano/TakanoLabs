const CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
};

export async function onRequestOptions() {
    return new Response(null, { status: 204, headers: CORS });
}

export async function onRequestPost({ request, env }) {
    try {
        const { nombre, correo, giro_empresa, descripcion } = await request.json();

        if (!nombre?.trim() || !correo?.trim() || !descripcion?.trim()) {
            return Response.json(
                { error: 'Los campos nombre, correo y descripción son obligatorios.' },
                { status: 400, headers: CORS }
            );
        }

        await env.DB
            .prepare('INSERT INTO contactos (nombre, correo, giro_empresa, descripcion) VALUES (?, ?, ?, ?)')
            .bind(nombre.trim(), correo.trim(), giro_empresa?.trim() || null, descripcion.trim())
            .run();

        return Response.json(
            { ok: true },
            { status: 200, headers: CORS }
        );
    } catch (err) {
        console.error('[contacto]', err?.message ?? err);
        return Response.json(
            { error: 'Error interno del servidor.' },
            { status: 500, headers: CORS }
        );
    }
}
