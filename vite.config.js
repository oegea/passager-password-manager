import { defineConfig, transformWithOxc } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * The codebase keeps JSX inside plain `.js` files. Vite only parses JSX in
 * `.jsx` files out of the box, so source files are transformed as JSX here.
 */
const jsxInJs = () => ({
    name: 'passager:jsx-in-js',
    enforce: 'pre',
    async transform(code, id) {
        const file = id.split('?')[0];
        if (!/\/src\/.*\.js$/.test(file)) return null;
        return transformWithOxc(code, file, {
            lang: 'jsx',
            jsx: { runtime: 'automatic' },
        });
    },
});

export default defineConfig({
    plugins: [jsxInJs(), react()],
    server: { port: 3000, host: true },
    preview: { port: 3000 },
    build: {
        outDir: 'build',
        sourcemap: false,
        // The Content-Security-Policy forbids inline scripts.
        modulePreload: { polyfill: false },
    },
    test: {
        environment: 'jsdom',
        globals: true,
        setupFiles: ['./src/setupTests.js'],
        include: ['src/**/*.test.js'],
        css: false,
    },
});
