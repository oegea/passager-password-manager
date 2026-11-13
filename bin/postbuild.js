/**
 * Post-build step.
 *
 * Stamps `build/service-worker.js` with a build id and the list of files to
 * keep available offline, so every build produces a different service worker.
 */
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const buildDir = path.join(rootDir, 'build');
const packageInfo = JSON.parse(
    fs.readFileSync(path.join(rootDir, 'package.json'), 'utf8')
);

const SERVICE_WORKER = 'service-worker.js';
// Never cached by the service worker
const NOT_PRECACHED = [SERVICE_WORKER, 'robots.txt'];
const BUILD_ID_PLACEHOLDER = "'__BUILD_ID__'";
const PRECACHE_PLACEHOLDER = "['__PRECACHE_FILES__']";

const walk = (dir) =>
    fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
        const entryPath = path.join(dir, entry.name);
        return entry.isDirectory() ? walk(entryPath) : [entryPath];
    });

const listFiles = (dir) =>
    walk(dir)
        .map((file) => path.relative(dir, file).split(path.sep).join('/'))
        .sort();

if (!fs.existsSync(buildDir)) {
    throw new Error('Build folder not found. Run the build first.');
}

const files = listFiles(buildDir);

// The former iOS / Android apps still ask the production site for this file.
// It must never exist: if it did, they would download this bundle and run it
// inside their WebView. Without it they keep using their own bundled version.
if (files.includes('version.manifest.json')) {
    throw new Error('version.manifest.json must not be published');
}
const serviceWorkerPath = path.join(buildDir, SERVICE_WORKER);
const serviceWorker = fs.readFileSync(serviceWorkerPath, 'utf8');
const isStamped = !serviceWorker.includes(BUILD_ID_PLACEHOLDER);

if (!isStamped) {
    if (!serviceWorker.includes(PRECACHE_PLACEHOLDER)) {
        throw new Error('Service worker placeholders not found');
    }

    // The build id depends on the content of every file: same build, same id
    const hash = createHash('sha256');
    for (const file of files) {
        if (file === SERVICE_WORKER) continue;
        hash.update(file);
        hash.update(fs.readFileSync(path.join(buildDir, file)));
    }
    const buildId = `${packageInfo.version}.${hash.digest('hex').slice(0, 12)}`;

    const precacheFiles = files
        .filter((file) => !NOT_PRECACHED.includes(file))
        .map((file) => `/${file}`);

    fs.writeFileSync(
        serviceWorkerPath,
        serviceWorker
            .replace(BUILD_ID_PLACEHOLDER, JSON.stringify(buildId))
            .replace(PRECACHE_PLACEHOLDER, JSON.stringify(precacheFiles))
    );
    console.log(
        `Service worker stamped: ${buildId} (${precacheFiles.length} files)`
    );
}
