/* =============================================================
   TakanoLabs — POST /api/contacto
   1) Inserta el contacto en D1 (binding "DB" → CalidadAlimentaria)
   2) Notifica por correo vía Resend (binding env "RESEND_API_KEY")
   ============================================================= */

const CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
};

/* ---------- Helpers ---------- */

// Escapa caracteres HTML para que el contenido del usuario
// no rompa ni inyecte HTML/JS en el correo de notificación.
function escapeHtml(str = '') {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

// Envía la notificación por correo a través de Resend.
// No lanza error si Resend falla — solo deja log.
// Así el usuario no ve un error si la BD ya guardó pero el correo falla.
async function notificarResend(env, { nombre, correo, giro_empresa, descripcion }) {
    if (!env.RESEND_API_KEY) {
        console.warn('[contacto] RESEND_API_KEY no configurada — se omite notificación.');
        return;
    }

    const giro = giro_empresa && giro_empresa.trim() ? escapeHtml(giro_empresa) : '—';
    const descripcionHtml = escapeHtml(descripcion).replace(/\n/g, '<br>');

    const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${env.RESEND_API_KEY}`,
        },
        body: JSON.stringify({
            from: 'TakanoLabs <notificaciones@adriantakano.com>',
            to: 'adrian.takano@icloud.com',
            reply_to: correo,
            subject: `Nuevo contacto TakanoLabs: ${nombre}`,
            html: `
                <div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;max-width:560px;margin:0 auto">
                    <h2 style="font-size:18px;color:#0A0A0B;border-bottom:2px solid #4F46E5;padding-bottom:8px">
                        Nuevo mensaje de contacto · TakanoLabs
                    </h2>
                    <table cellpadding="8" style="border-collapse:collapse;font-size:14px;color:#0A0A0B;width:100%">
                        <tr>
                            <td style="background:#F4F4F0;width:160px"><strong>Nombre</strong></td>
                            <td>${escapeHtml(nombre)}</td>
                        </tr>
                        <tr>
                            <td style="background:#F4F4F0"><strong>Correo</strong></td>
                            <td><a href="mailto:${escapeHtml(correo)}" style="color:#4F46E5">${escapeHtml(correo)}</a></td>
                        </tr>
                        <tr>
                            <td style="background:#F4F4F0"><strong>Giro de empresa</strong></td>
                            <td>${giro}</td>
                        </tr>
                        <tr>
                            <td style="background:#F4F4F0;vertical-align:top"><strong>Descripción</strong></td>
                            <td>${descripcionHtml}</td>
                        </tr>
                    </table>
                    <p style="font-size:12px;color:#737373;margin-top:16px">
                        Enviado desde el formulario de contacto de takanolabs.com
                    </p>
                </div>
            `,
        }),
    });

    if (!res.ok) {
        const txt = await res.text().catch(() => '');
        console.error('[contacto] Resend error:', res.status, txt);
    }
}

/* ---------- Handlers ---------- */

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

        const datos = {
            nombre: nombre.trim(),
            correo: correo.trim(),
            giro_empresa: giro_empresa?.trim() || null,
            descripcion: descripcion.trim(),
        };

        // 1) Persistir en D1
        await env.DB
            .prepare('INSERT INTO contactos (nombre, correo, giro_empresa, descripcion) VALUES (?, ?, ?, ?)')
            .bind(datos.nombre, datos.correo, datos.giro_empresa, datos.descripcion)
            .run();

        // 2) Notificar por correo (no bloqueante en caso de error)
        try {
            await notificarResend(env, datos);
        } catch (err) {
            console.error('[contacto] notificarResend falló:', err?.message ?? err);
        }

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
