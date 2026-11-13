/* Passager — information site. No dependencies. */
(() => {
    const root = document.documentElement;
    const prefersReducedMotion = window.matchMedia(
        '(prefers-reduced-motion: reduce)'
    ).matches;

    const store = {
        get(key) {
            try {
                return localStorage.getItem(key);
            } catch (e) {
                return null;
            }
        },
        set(key, value) {
            try {
                localStorage.setItem(key, value);
            } catch (e) {
                // Private mode: the choice just lasts for this visit
            }
        },
    };

    // ------------------------------------------------------------- Theme
    const themeColors = { light: '#f6f7fb', dark: '#07080c' };
    const applyTheme = (theme) => {
        root.setAttribute('data-theme', theme);
        const meta = document.querySelector('meta[name="theme-color"]');
        if (meta) meta.setAttribute('content', themeColors[theme]);
    };
    document.getElementById('theme-toggle').addEventListener('click', () => {
        const next =
            root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        store.set('site-theme', next);
        applyTheme(next);
    });
    applyTheme(root.getAttribute('data-theme') || 'light');

    // ---------------------------------------------------------- Language
    const es = {
        skip: 'Saltar al contenido',
        'nav.features': 'Funciones',
        'nav.security': 'Seguridad',
        'nav.teams': 'Para equipos',
        'nav.story': 'Historia',
        'nav.faq': 'Preguntas',
        'cta.open': 'Abrir Passager',
        'hero.pill': 'Código abierto · AGPL-3.0 · Gratis para siempre',
        'hero.title1': 'Tus secretos.',
        'hero.title2': 'Tus claves.',
        'hero.title3': 'De nadie más.',
        'hero.lead':
            'Passager es el gestor de contraseñas que lo cifra todo en tu navegador antes de que salga de él. Úsalo por tu cuenta sin crear ninguna cuenta, o móntalo en tu propio servidor para todo tu equipo.',
        'hero.cta1': 'Empieza ahora, es gratis',
        'hero.cta2': 'Ver el código',
        'hero.fact1': 'Sin registro, sin e-mail, sin rastreo',
        'hero.fact2': 'Funciona sin conexión y se instala como una app',
        'hero.fact3': 'Desbloquea con Face ID o tu huella',
        'float.pw': 'Contraseña',
        'float.card': 'Tarjeta',
        'float.key': 'Par de claves',
        'float.file': 'Fichero',
        'float.note': 'Nota',
        'stats.1': 'de cifrado para todo lo que guardas',
        'stats.2': 'rondas de derivación sobre tu contraseña maestra',
        'stats.3': 'librerías de cifrado de terceros. Solo la de tu navegador',
        'stats.4': 'código abierto. Lee cada línea',
        'demo.eyebrow': 'Pruébalo aquí mismo',
        'demo.title': 'Esto es todo lo que ve un servidor.',
        'demo.lead':
            'Escribe lo que quieras a la izquierda. Se cifra en tu navegador con AES-256-GCM de verdad, exactamente como lo hace Passager. Nada de lo que escribes sale de esta página.',
        'demo.you': 'Lo que escribes',
        'demo.server': 'Lo que se guarda',
        'demo.hint1': 'Se queda en tu dispositivo',
        'demo.hint2': 'Ilegible sin tu clave, también para nosotros',
        'features.eyebrow': 'Todo en una sola caja fuerte',
        'features.title': 'Mucho más que contraseñas.',
        'features.lead':
            'Lo que no te puedes permitir perder, ni que se filtre, por fin en el mismo sitio.',
        'f1.title': 'Cinco tipos de secretos',
        'f1.text':
            'Accesos, tarjetas de pago, pares de claves SSH y de API, ficheros y notas seguras de texto libre. Cada uno con los campos que necesita y copia con un toque.',
        'f2.title': 'Face ID, Touch ID, huella',
        'f2.text':
            'Desbloquea con una mirada. Tu contraseña maestra nunca se guarda: la clave queda protegida por el hardware seguro de tu propio dispositivo.',
        'f3.title': 'Se instala en todas partes y funciona sin conexión',
        'f3.text':
            'Un clic para añadirlo a tu móvil, tableta u ordenador. Sin tiendas de apps ni actualizaciones que perseguir, y tu caja fuerte personal se abre sin conexión.',
        'f4.title': 'Cómodo en cualquier pantalla',
        'f4.text':
            'Diseñado para el móvil en tu mano y el monitor de tu mesa, en claro y en oscuro.',
        'f5.title': 'Ficheros de hasta 50 MB',
        'f5.text':
            'Escaneos del pasaporte, certificados, códigos de recuperación. Cifrados en tu dispositivo y guardados en trozos que nadie más puede recomponer.',
        'f6.title': 'Se bloquea solo',
        'f6.text':
            'Diez minutos sin actividad y la caja fuerte se cierra. Levántate de la mesa sin pensar en ello.',
        'f7.title': 'Contraseñas fuertes al instante',
        'f7.text':
            'Un generador integrado con la longitud y los caracteres que elijas. Deja de reutilizar esa contraseña.',
        'f8.title': 'Encuentra cualquier cosa al momento',
        'f8.text':
            'Busca en todas las carpetas, las tuyas y las que comparten contigo, y ve directo a lo que necesitas.',
        'f9.title': 'Tus datos, portables',
        'f9.text':
            'Descarga una copia cifrada completa cuando quieras y restáurala en otro dispositivo. Sin ataduras.',
        'sec.eyebrow': 'Seguridad que puedes comprobar',
        'sec.title': 'No podemos leer tus datos. Por diseño.',
        'sec.lead':
            'Nada de «confía en nosotros». El cifrado ocurre en tu navegador, con su criptografía nativa, y el código es público.',
        's1.title': 'Una contraseña maestra que solo tú conoces',
        's1.text':
            'Se convierte en una clave de cifrado con PBKDF2 y 600.000 rondas, lo que hace que adivinarla sea desesperadamente lento. Nunca sale de tu dispositivo.',
        's2.title': 'Un par de claves personal',
        's2.text':
            'Cada persona tiene un par de claves RSA-4096. La mitad privada se bloquea con tu clave maestra antes de guardarse en ningún sitio.',
        's3.title': 'Una clave por carpeta',
        's3.text':
            'Cada carpeta tiene su propia clave AES-256. Lo que guardas se cifra con ella, en tu dispositivo, antes de enviarse.',
        's4.title': 'Compartir sin exponer',
        's4.text':
            'Para compartir una carpeta, su clave se cifra con la clave pública de tu compañero. Solo esa persona puede abrirla. El servidor solo entrega un sobre cerrado.',
        'c1.title': 'Qué guarda el servidor',
        'c1.text':
            'Datos cifrados, los nombres que pones a carpetas y elementos, tu e-mail y con quién compartes cada carpeta. Nunca una contraseña, nunca una clave que pueda usar.',
        'c2.title': 'Qué no puede hacer nadie',
        'c2.text':
            'Recuperar tu contraseña maestra. Ni nosotros ni tu administrador. Si la pierdes, tus datos siguen cerrados: de eso se trata.',
        'c3.title': 'Qué puedes comprobar',
        'c3.text':
            'Todo. La app, el backend y los tests son código abierto, con una lista de dependencias deliberadamente corta.',
        'modes.eyebrow': 'Dos formas de usarlo',
        'modes.title': 'Solo tú, o todo tu equipo.',
        'm1.tag': 'Personal',
        'm1.title': 'Todo se queda en tu dispositivo',
        'm1.text':
            'Abre la app y empieza. Sin cuenta, sin servidor, sin internet. Tu caja fuerte vive en tu navegador, cifrada.',
        'm1.a': 'Listo en diez segundos',
        'm1.b': 'Funciona totalmente sin conexión',
        'm1.c': 'Copias de seguridad que controlas tú',
        'm1.cta': 'Abrir mi caja fuerte',
        'm2.tag': 'Organización',
        'm2.title': 'Tu servidor, tus reglas',
        'm2.text':
            'Ejecuta el backend de Passager en tu propia infraestructura. Las personas entran con un código enviado a su e-mail y comparten carpetas entre sí, con cifrado de extremo a extremo.',
        'm2.a': 'Comparte carpetas con tu equipo',
        'm2.b': 'Acceso desde todos tus dispositivos',
        'm2.c': 'Limita el acceso a los dominios de e-mail de tu empresa',
        'm2.cta': 'Leer la guía de instalación',
        'story.eyebrow': 'La historia',
        'story.title': 'Nació porque nada encajaba.',
        'story.p1':
            'El mundo no necesitaba otro gestor de contraseñas. Pero yo necesitaba uno que fuera de código abierto, sencillo de usar y fácil de instalar y mantener para un equipo, y nunca lo encontré.',
        'story.p2':
            'Así que construí Passager sobre tres ideas que siguen guiando cada decisión: simple para quien lo usa y para quien lo administra, seguro por diseño, y útil para equipos sin debilitar esa seguridad.',
        'story.sign': 'creador de Passager',
        't1.when': '2022 · El principio',
        't1.title': 'Una caja fuerte de código abierto',
        't1.text':
            'Passager se publica bajo licencia AGPL, con todo el cifrado hecho en el navegador desde el primer día.',
        't2.when': 'Independencia',
        't2.title': 'Un backend que cualquiera puede alojar',
        't2.text':
            'Las primeras versiones dependían de una nube de terceros. Se sustituyó por un backend propio y pequeño, para que cada organización guarde sus datos en su infraestructura.',
        't3.when': 'En todas partes',
        't3.title': 'También en el móvil',
        't3.text':
            'Passager llega a iOS y Android, con desbloqueo biométrico, para llevar la caja fuerte siempre en el bolsillo.',
        't4.when': 'Hoy · Passager 2',
        't4.title': 'Más ligero, más fuerte, para todo',
        't4.text':
            'Una sola app web instalable en lugar de apps nativas separadas. Derivación de claves más robusta, un backend con solo dos dependencias, nuevos tipos de elementos, ficheros grandes y un diseño completamente nuevo.',
        'faq.eyebrow': 'Buenas preguntas',
        'faq.title': 'Antes de confiarle tus secretos.',
        'q1.q': '¿De verdad es gratis?',
        'q1.a': 'Sí. Passager es código abierto bajo licencia AGPL-3.0. No hay planes de pago, ni anuncios, ni rastreo.',
        'q2.q': '¿Qué pasa si olvido mi contraseña maestra?',
        'q2.a': 'Nadie puede recuperarla, porque nadie más la tiene nunca. Eso es lo que mantiene tus datos privados. Elige una que vayas a recordar y guarda una copia de seguridad.',
        'q3.q': '¿Dónde se guardan mis datos?',
        'q3.a': 'En modo personal, solo en el navegador de tu dispositivo. En modo organización, cifrados, en el servidor que gestiona tu organización. No operamos un servicio central que guarde tu caja fuerte.',
        'q4.q': '¿Hay app para mi móvil?',
        'q4.a': 'Passager es una app web que puedes instalar. Ábrela en tu navegador y elige «Instalar» o «Añadir a pantalla de inicio»: tendrá su propio icono, se abrirá a pantalla completa, funcionará sin conexión y se desbloqueará con Face ID o tu huella.',
        'q5.q': '¿Puedo llevarme mis contraseñas más adelante?',
        'q5.a': 'Siempre. Puedes descargar una copia completa de tu caja fuerte en cualquier momento. Tus datos son tuyos.',
        'q6.q': '¿Ha pasado una auditoría?',
        'q6.a': 'Todavía no por una firma externa, y preferimos decírtelo a insinuar lo contrario. Lo que sí ofrecemos es transparencia total: algoritmos estándar y conocidos, la criptografía nativa del navegador y cada línea de código abierta a revisión.',
        'final.title': 'Recupera tus secretos.',
        'final.text': 'Son diez segundos y ninguna cuenta. Tu primera caja fuerte está a un clic.',
        'final.cta1': 'Abrir Passager',
        'final.cta2': 'Danos una estrella en GitHub',
        'footer.made': 'Hecho con mimo en Barcelona.',
        'footer.license': 'Publicado bajo AGPL-3.0',
        'footer.app': 'App web',
        'footer.backend': 'Auto-alojamiento',
        'footer.issues': 'Informar de un problema',
        'footer.disclaimer':
            'Passager es un proyecto personal de código abierto, que se ofrece tal cual y sin garantía. Mantenlo actualizado y haz copias de seguridad.',
    };
    const meta = {
        en: {
            title: document.title,
            description: document
                .querySelector('meta[name="description"]')
                .getAttribute('content'),
        },
        es: {
            title: 'Passager — El gestor de contraseñas de código abierto que de verdad es tuyo',
            description:
                'Passager es un gestor de contraseñas de código abierto con cifrado de extremo a extremo. Contraseñas, tarjetas, claves, ficheros y notas, cifrados en tu navegador. Úsalo sin cuenta o alójalo para tu equipo.',
        },
    };

    const nodes = Array.from(document.querySelectorAll('[data-i18n]'));
    const english = new Map(nodes.map((node) => [node, node.textContent]));
    const langToggle = document.getElementById('lang-toggle');

    const applyLanguage = (lang) => {
        root.lang = lang;
        for (const node of nodes) {
            const key = node.getAttribute('data-i18n');
            node.textContent =
                lang === 'es' && es[key] ? es[key] : english.get(node).trim();
        }
        document.title = meta[lang].title;
        document
            .querySelector('meta[name="description"]')
            .setAttribute('content', meta[lang].description);
        langToggle.textContent = lang === 'es' ? 'EN' : 'ES';
        langToggle.setAttribute(
            'aria-label',
            lang === 'es' ? 'Switch to English' : 'Cambiar a español'
        );
        formatCounters();
    };

    const initialLanguage =
        store.get('site-lang') ||
        ((navigator.language || 'en').toLowerCase().startsWith('es')
            ? 'es'
            : 'en');
    langToggle.addEventListener('click', () => {
        const next = root.lang === 'es' ? 'en' : 'es';
        store.set('site-lang', next);
        applyLanguage(next);
    });

    // ---------------------------------------------------------- Counters
    const counters = Array.from(document.querySelectorAll('[data-count]'));
    const formatNumber = (value) =>
        new Intl.NumberFormat(root.lang === 'es' ? 'es-ES' : 'en-US').format(
            value
        );
    function formatCounters() {
        for (const counter of counters) {
            if (!counter.dataset.running)
                counter.textContent = formatNumber(
                    Number(counter.dataset.count)
                );
        }
    }
    const runCounter = (counter) => {
        const target = Number(counter.dataset.count);
        if (prefersReducedMotion) return;
        counter.dataset.running = '1';
        const start = performance.now();
        const duration = 1400;
        const tick = (now) => {
            const progress = Math.min(1, (now - start) / duration);
            const eased = 1 - Math.pow(1 - progress, 3);
            counter.textContent = formatNumber(Math.round(target * eased));
            if (progress < 1) requestAnimationFrame(tick);
            else delete counter.dataset.running;
        };
        requestAnimationFrame(tick);
    };

    applyLanguage(initialLanguage);

    // ------------------------------------------------------------ Reveal
    const revealed = Array.from(document.querySelectorAll('.reveal'));
    if ('IntersectionObserver' in window && !prefersReducedMotion) {
        const observer = new IntersectionObserver(
            (entries) => {
                // Elements entering together appear one after another
                entries
                    .filter((entry) => entry.isIntersecting)
                    .forEach((entry, index) => {
                        entry.target.style.setProperty(
                            '--delay',
                            `${Math.min(index, 6) * 70}ms`
                        );
                        entry.target.classList.add('is-visible');
                        const counter =
                            entry.target.querySelector('[data-count]');
                        if (counter) runCounter(counter);
                        observer.unobserve(entry.target);
                    });
            },
            { rootMargin: '0px 0px -8% 0px', threshold: 0.08 }
        );
        revealed.forEach((element) => observer.observe(element));
    } else {
        revealed.forEach((element) => element.classList.add('is-visible'));
    }

    // -------------------------------------------------------- Navigation
    const nav = document.querySelector('.nav');
    const onScroll = () =>
        nav.classList.toggle('is-scrolled', window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    // ------------------------------------------------ Pointer highlights
    if (!prefersReducedMotion && window.matchMedia('(hover: hover)').matches) {
        for (const card of document.querySelectorAll('.card')) {
            card.addEventListener('pointermove', (event) => {
                const box = card.getBoundingClientRect();
                card.style.setProperty('--mx', `${event.clientX - box.left}px`);
                card.style.setProperty('--my', `${event.clientY - box.top}px`);
            });
        }

        const heroWindow = document.getElementById('hero-window');
        const visual = heroWindow.parentElement;
        visual.addEventListener('pointermove', (event) => {
            const box = visual.getBoundingClientRect();
            const x = (event.clientX - box.left) / box.width - 0.5;
            const y = (event.clientY - box.top) / box.height - 0.5;
            heroWindow.style.transform = `rotateY(${-9 + x * 10}deg) rotateX(${4 - y * 8}deg)`;
        });
        visual.addEventListener('pointerleave', () => {
            heroWindow.style.transform = '';
        });
    }

    // --------------------------------------------------- Encryption demo
    const input = document.getElementById('demo-input');
    const output = document.getElementById('demo-output');
    const arrow = document.querySelector('.demo__arrow');
    const toBase64 = (bytes) => {
        let binary = '';
        for (const byte of bytes) binary += String.fromCharCode(byte);
        return btoa(binary);
    };

    if (window.crypto && window.crypto.subtle && window.isSecureContext) {
        // A key that only exists in this page, like a folder key in Passager
        const keyPromise = window.crypto.subtle.generateKey(
            { name: 'AES-GCM', length: 256 },
            false,
            ['encrypt']
        );
        let latest = 0;
        const encrypt = async () => {
            const current = ++latest;
            const iv = window.crypto.getRandomValues(new Uint8Array(12));
            const encrypted = new Uint8Array(
                await window.crypto.subtle.encrypt(
                    { name: 'AES-GCM', iv },
                    await keyPromise,
                    new TextEncoder().encode(input.value)
                )
            );
            if (current !== latest) return;
            const bytes = new Uint8Array(iv.length + encrypted.length);
            bytes.set(iv, 0);
            bytes.set(encrypted, iv.length);
            output.textContent = toBase64(bytes);
            arrow.classList.remove('is-busy');
            // Restart the animation
            void arrow.offsetWidth;
            arrow.classList.add('is-busy');
        };
        input.addEventListener('input', encrypt);
        encrypt();
    } else {
        output.textContent = 'q1ZKLS5RslIqLU4tSs7PS1WqBQA9zqk8Kj0…';
    }
})();
