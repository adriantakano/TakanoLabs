/* =============================================================
   TakanoLabs — main.js
   Nav · Scroll reveal · Formulario de contacto
   ============================================================= */

(() => {
    'use strict';

    /* ---------- NAV: scroll state + toggle mobile ---------- */
    const nav = document.getElementById('nav');
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');

    if (nav) {
        const onScroll = () => {
            if (window.scrollY > 8) nav.classList.add('nav--scrolled');
            else nav.classList.remove('nav--scrolled');
        };
        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll();
    }

    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            navMenu.classList.toggle('nav__menu--open');
            navToggle.classList.toggle('nav__toggle--active');
        });
        // Cerrar al hacer click en un link
        navMenu.querySelectorAll('a').forEach(a => {
            a.addEventListener('click', () => {
                navMenu.classList.remove('nav__menu--open');
                navToggle.classList.remove('nav__toggle--active');
            });
        });
    }

    /* ---------- SCROLL REVEAL ---------- */
    const reveals = document.querySelectorAll('.reveal');
    if (reveals.length && 'IntersectionObserver' in window) {
        const io = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('reveal--visible');
                    io.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
        reveals.forEach(el => io.observe(el));
    } else {
        // Fallback: mostrar todo
        reveals.forEach(el => el.classList.add('reveal--visible'));
    }

    /* ---------- FORMULARIO DE CONTACTO ---------- */
    const form = document.getElementById('contactForm');
    const formWrap = document.getElementById('contactFormWrap');
    const formError = document.getElementById('formError');
    const formSuccess = document.getElementById('formSuccess');
    const formSubmit = document.getElementById('formSubmit');

    if (form) {
        const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        const showError = (msg) => {
            if (formError) formError.textContent = msg;
        };

        const clearError = () => {
            if (formError) formError.textContent = '';
        };

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            clearError();

            const fd = new FormData(form);
            const payload = {
                nombre: (fd.get('nombre') || '').toString().trim(),
                correo: (fd.get('correo') || '').toString().trim(),
                giro_empresa: (fd.get('giro_empresa') || '').toString().trim(),
                descripcion: (fd.get('descripcion') || '').toString().trim(),
            };

            // Validación inline
            if (!payload.nombre || !payload.correo || !payload.descripcion) {
                showError('Por favor completa los campos obligatorios.');
                return;
            }
            if (!EMAIL_RE.test(payload.correo)) {
                showError('El correo electrónico no tiene un formato válido.');
                return;
            }

            formSubmit.disabled = true;
            const originalLabel = formSubmit.textContent;
            formSubmit.textContent = 'Enviando…';

            try {
                const res = await fetch('/api/contacto', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                });

                if (res.ok) {
                    // Éxito: ocultar form y mostrar confirmación en el mismo contenedor
                    form.hidden = true;
                    if (formSuccess) formSuccess.hidden = false;
                    if (formWrap) formWrap.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    return;
                }

                if (res.status === 400) {
                    const data = await res.json().catch(() => ({}));
                    showError(data.error || 'Revisa los campos del formulario.');
                } else {
                    showError('Ocurrió un error al enviar el mensaje. Inténtalo de nuevo.');
                }
            } catch (err) {
                showError('No se pudo conectar con el servidor. Verifica tu conexión.');
            } finally {
                formSubmit.disabled = false;
                formSubmit.textContent = originalLabel;
            }
        });

        // Limpiar error cuando el usuario corrige
        form.querySelectorAll('input, textarea').forEach(el => {
            el.addEventListener('input', clearError);
        });
    }
})();
