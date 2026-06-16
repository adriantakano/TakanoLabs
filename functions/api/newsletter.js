/* =============================================================
   TakanoLabs — POST /api/newsletter
   1) Valida + normaliza email · honeypot anti-spam
   2) INSERT anti-duplicado en D1 (newsletter_blog_subscribers)
   3) Correo de confirmación vía Resend (no bloqueante)
   ============================================================= */

const CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function escapeHtml(str = '') {
    return String(str)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

// Correo de confirmación al suscriptor. No lanza si Resend falla (solo log).
async function enviarConfirmacion(env, email) {
    if (!env.RESEND_API_KEY) {
        console.warn('[newsletter] RESEND_API_KEY no configurada — se omite confirmación.');
        return;
    }
    const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${env.RESEND_API_KEY}`,
        },
        body: JSON.stringify({
            from: 'Takano Labs <notificaciones@adriantakano.com>',
            to: email,
            subject: '¡Listo! Estás suscrito al boletín de Takano Labs',
            html: `
                <div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;max-width:520px;margin:0 auto;color:#0a0a0a">
                    <h2 style="font-size:20px;border-bottom:2px solid #0a0a0a;padding-bottom:8px">
                        Gracias por suscribirte
                    </h2>
                    <p style="font-size:15px;line-height:1.6">
                        Recibirás lo nuevo de <strong>Takano Labs</strong>: Química &amp; Vida,
                        Economía Digital y Pulso Urbano. Ciencia, tecnología y sociedad,
                        explicadas para México.
                    </p>
                    <p style="font-size:13px;color:#737373;margin-top:24px">
                        Si no fuiste tú, ignora este mensaje y no te incluiremos.
                    </p>
                </div>
            `,
        }),
    });
    if (!res.ok) {
        const txt = await res.text().catch(() => '');
        console.error('[newsletter] Resend error:', res.status, txt);
    }
}

export async function onRequestOptions() {
    return new Response(null, { status: 204, headers: CORS });
}

export async function onRequestPost({ request, env }) {
    try {
        const body = await request.json().catch(() => ({}));
        const { email, website, source } = body;

        // Honeypot: si el campo oculto viene lleno, es bot. Respondemos ok sin guardar.
        if (website && String(website).trim() !== '') {
            return Response.json({ ok: true }, { status: 200, headers: CORS });
        }

        const normalizado = String(email || '').trim().toLowerCase();
        if (!EMAIL_RE.test(normalizado)) {
            return Response.json(
                { error: 'Correo electrónico no válido.' },
                { status: 400, headers: CORS },
            );
        }

        const createdAt = new Date().toISOString();
        const src = source ? String(source).trim().slice(0, 200) : null;

        // INSERT anti-duplicado: si el email ya existe (UNIQUE), no hace nada.
        const result = await env.DB
            .prepare(
                `INSERT INTO newsletter_blog_subscribers (email, created_at, source, active)
                 VALUES (?, ?, ?, 1)
                 ON CONFLICT(email) DO NOTHING`,
            )
            .bind(normalizado, createdAt, src)
            .run();

        const esNuevo = result?.meta?.changes > 0;

        // Solo enviamos confirmación a suscriptores nuevos.
        if (esNuevo) {
            try {
                await enviarConfirmacion(env, normalizado);
            } catch (err) {
                console.error('[newsletter] confirmación falló:', err?.message ?? err);
            }
        }

        return Response.json(
            { ok: true, alreadySubscribed: !esNuevo },
            { status: 200, headers: CORS },
        );
    } catch (err) {
        console.error('[newsletter]', err?.message ?? err);
        return Response.json(
            { error: 'Error interno del servidor.' },
            { status: 500, headers: CORS },
        );
    }
}
