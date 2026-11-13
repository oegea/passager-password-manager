/**
 * This file is part of Passager Password Manager.
 * https://github.com/oegea/passager-password-manager
 *
 * Copyright (C) 2022 Oriol Egea Carvajal
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

// Third party dependencies
import { createGlobalStyle } from 'styled-components';

/**
 * Design tokens and base styles. Components only use these variables, so
 * both themes stay consistent.
 */
const GlobalStyle = createGlobalStyle`
    :root {
        --font-sans: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Inter',
            'Roboto', 'Helvetica Neue', Arial, sans-serif;
        --font-mono: ui-monospace, 'SF Mono', 'Cascadia Code', Menlo, Monaco,
            Consolas, monospace;

        --radius-sm: 8px;
        --radius-md: 12px;
        --radius-lg: 16px;
        --radius-xl: 22px;
        --radius-full: 999px;

        --ease-out: cubic-bezier(0.22, 1, 0.36, 1);
        --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
        --duration-fast: 140ms;
        --duration-base: 240ms;
        --duration-slow: 420ms;

        --toolbar-height: 64px;

        color-scheme: light;
        --color-bg: #f4f5f8;
        --color-bg-gradient: radial-gradient(1200px 600px at 10% -10%, #e6e9ff 0%, transparent 60%),
            radial-gradient(900px 500px at 100% 0%, #e3f4ff 0%, transparent 55%);
        --color-surface: #ffffff;
        --color-surface-raised: #ffffff;
        --color-surface-sunken: #f1f3f7;
        --color-surface-hover: #eef0f5;
        --color-surface-active: #e5e8ef;
        --color-glass: rgba(255, 255, 255, 0.78);
        --color-border: #e2e5ec;
        --color-border-strong: #cdd2dc;
        --color-text: #12151b;
        --color-text-muted: #5b6472;
        --color-text-faint: #8b93a1;
        --color-accent: #4f46e5;
        --color-accent-hover: #4338ca;
        --color-accent-contrast: #ffffff;
        --color-accent-soft: rgba(79, 70, 229, 0.1);
        --color-accent-ring: rgba(79, 70, 229, 0.28);
        --color-danger: #dc2626;
        --color-danger-hover: #b91c1c;
        --color-danger-soft: rgba(220, 38, 38, 0.09);
        --color-success: #15803d;
        --color-success-soft: rgba(21, 128, 61, 0.1);
        --color-warning: #b45309;
        --color-overlay: rgba(15, 18, 25, 0.42);
        --shadow-sm: 0 1px 2px rgba(16, 24, 40, 0.06);
        --shadow-md: 0 6px 20px rgba(16, 24, 40, 0.08), 0 1px 3px rgba(16, 24, 40, 0.06);
        --shadow-lg: 0 24px 64px rgba(16, 24, 40, 0.18), 0 2px 8px rgba(16, 24, 40, 0.08);
    }

    :root[data-theme='dark'] {
        color-scheme: dark;
        --color-bg: #0b0d11;
        --color-bg-gradient: radial-gradient(1200px 600px at 10% -10%, rgba(99, 91, 255, 0.16) 0%, transparent 60%),
            radial-gradient(900px 500px at 100% 0%, rgba(56, 189, 248, 0.1) 0%, transparent 55%);
        --color-surface: #14171d;
        --color-surface-raised: #1a1e26;
        --color-surface-sunken: #0f1217;
        --color-surface-hover: #1d222b;
        --color-surface-active: #262c37;
        --color-glass: rgba(20, 23, 29, 0.76);
        --color-border: #262b35;
        --color-border-strong: #363d4a;
        --color-text: #eef1f6;
        --color-text-muted: #a0a9b8;
        --color-text-faint: #6f7887;
        --color-accent: #8b83ff;
        --color-accent-hover: #a29bff;
        --color-accent-contrast: #0d0f14;
        --color-accent-soft: rgba(139, 131, 255, 0.16);
        --color-accent-ring: rgba(139, 131, 255, 0.36);
        --color-danger: #f87171;
        --color-danger-hover: #fca5a5;
        --color-danger-soft: rgba(248, 113, 113, 0.14);
        --color-success: #4ade80;
        --color-success-soft: rgba(74, 222, 128, 0.14);
        --color-warning: #fbbf24;
        --color-overlay: rgba(0, 0, 0, 0.6);
        --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.4);
        --shadow-md: 0 8px 24px rgba(0, 0, 0, 0.36), 0 1px 3px rgba(0, 0, 0, 0.3);
        --shadow-lg: 0 28px 72px rgba(0, 0, 0, 0.6), 0 2px 8px rgba(0, 0, 0, 0.4);
    }

    *, *::before, *::after {
        box-sizing: border-box;
    }

    html {
        -webkit-text-size-adjust: 100%;
    }

    body {
        margin: 0;
        background: var(--color-bg);
        color: var(--color-text);
        font-family: var(--font-sans);
        font-size: 15px;
        line-height: 1.5;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        transition: background-color var(--duration-base) ease,
            color var(--duration-base) ease;
    }

    h1, h2, h3 {
        letter-spacing: -0.02em;
        line-height: 1.2;
    }

    a {
        color: var(--color-accent);
        text-underline-offset: 3px;
    }

    p {
        margin: 0 0 12px;
    }

    ul, ol {
        padding-left: 20px;
        color: var(--color-text-muted);
    }

    li {
        margin-bottom: 6px;
    }

    code, pre {
        font-family: var(--font-mono);
    }

    ::selection {
        background: var(--color-accent-soft);
    }

    :focus-visible {
        outline: 2px solid var(--color-accent);
        outline-offset: 2px;
    }

    /*
     * iOS zooms the page when a field with text smaller than 16px gets the
     * focus. Fields are 16px on touch screens so that never happens, and
     * people can still zoom by themselves.
     */
    @media (max-width: 768px), (pointer: coarse) {
        input,
        textarea,
        select {
            font-size: 16px !important;
        }
    }

    /* Thin, unobtrusive scrollbars */
    * {
        scrollbar-width: thin;
        scrollbar-color: var(--color-border-strong) transparent;
    }

    @keyframes passager-fade-up {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: none; }
    }

    @keyframes passager-fade-in {
        from { opacity: 0; }
        to { opacity: 1; }
    }

    @media (prefers-reduced-motion: reduce) {
        *, *::before, *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
            scroll-behavior: auto !important;
        }
    }
`;

export default GlobalStyle;
