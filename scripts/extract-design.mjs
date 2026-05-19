// Extracts reusable artifacts from the Claude Design prototype so both the API
// seed and the web app stay byte-faithful to the approved design.
//
//   1. The full <style> block            -> apps/web/src/styles/prototype.css
//   2. The base64 logo blobs             -> apps/web/public/brand/*.png
//   3. The whole screen-render JS         -> apps/web/src/prototype/engine.js
//      (everything between the design-token script start and </body>, minus the
//       Chart.js/Lucide CDN tags which the web app imports as npm packages)
//
// Run: node scripts/extract-design.mjs
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const ROOT = resolve(process.cwd());
const SRC = resolve(
  ROOT,
  '_design_extracted/dashboard-project/project/Dashboard Kinerja PUSMANPRO v3.html',
);
const html = readFileSync(SRC, 'utf8');
const lines = html.split('\n');

const ensure = (p) => { if (!existsSync(dirname(p))) mkdirSync(dirname(p), { recursive: true }); };
const write = (p, c) => { ensure(p); writeFileSync(p, c); console.log('wrote', p, `(${c.length} bytes)`); };

// ---- 1. CSS ------------------------------------------------------------
const styleStart = html.indexOf('<style>');
const styleEnd = html.indexOf('</style>');
const css = html.slice(styleStart + '<style>'.length, styleEnd).trim();
write(resolve(ROOT, 'apps/web/src/styles/prototype.css'), css + '\n');

// ---- 2. Logo blobs -----------------------------------------------------
// The assets script sets window.__X = 'data:image/png;base64,....'
const assetRe = /window\.(__[A-Z0-9_]+)\s*=\s*'data:image\/(png|jpeg|svg\+xml);base64,([A-Za-z0-9+/=]+)'/g;
let m;
const assetMap = {};
while ((m = assetRe.exec(html)) !== null) {
  const [, name, ext, b64] = m;
  const fileExt = ext === 'svg+xml' ? 'svg' : ext === 'jpeg' ? 'jpg' : 'png';
  const file = `apps/web/public/brand/${name.replace(/^__/, '').toLowerCase()}.${fileExt}`;
  write(resolve(ROOT, file), Buffer.from(b64, 'base64'));
  assetMap[name] = '/brand/' + file.split('/').pop();
}
write(
  resolve(ROOT, 'apps/web/src/prototype/assets.json'),
  JSON.stringify(assetMap, null, 2) + '\n',
);

// ---- 3. Screen-render engine ------------------------------------------
// Take from the first app <script> after the asset script through </body>,
// strip <script ...> / </script> tags and the two CDN <script src> lines.
const bodyEnd = html.indexOf('</body>');
const firstAppScript = html.indexOf('<script>', styleEnd);
let chunk = html.slice(firstAppScript, bodyEnd);
chunk = chunk
  .replace(/<script[^>]*src=["']https?:\/\/[^>]*><\/script>/g, '')
  .replace(/<script[^>]*>/g, '\n// ===== script segment =====\n')
  .replace(/<\/script>/g, '\n');
write(resolve(ROOT, 'apps/web/src/prototype/engine.js'), chunk.trim() + '\n');

// ---- 4. DATA object + key constants as JSON for the API seed -----------
// Evaluate the prototype's DATA / ROLES / ROUTES / KPI_DEEPDIVE_DATA in a
// sandbox by slicing their literals. They are plain object/array literals
// with getters; we reconstruct via Function from the engine source.
const seedSrc = `
${chunk}
;return {
  DATA: typeof DATA!=='undefined'?DATA:null,
  ROLES: typeof ROLES!=='undefined'?ROLES:null,
  ROUTES: typeof ROUTES!=='undefined'?ROUTES:null,
  ROLE_TO_STAGE: typeof ROLE_TO_STAGE!=='undefined'?ROLE_TO_STAGE:null,
  KPI_DEEPDIVE_DATA: typeof KPI_DEEPDIVE_DATA!=='undefined'?KPI_DEEPDIVE_DATA:null,
};`;
let bundle = null;
try {
  // Provide minimal browser globals the top-level code may touch.
  const win = {};
  const doc = {
    documentElement: { style: {}, setAttribute() {}, getAttribute() { return null; } },
    getElementById() { return null; },
    querySelector() { return null; },
    querySelectorAll() { return []; },
    addEventListener() {},
    createElement() { return { style: {}, setAttribute() {}, appendChild() {} }; },
    body: { classList: { add() {}, remove() {}, contains() { return false; } } },
  };
  const fn = new Function(
    'window', 'document', 'localStorage', 'navigator', 'Chart', 'lucide', 'console',
    seedSrc,
  );
  bundle = fn(
    win, doc,
    { getItem() { return null; }, setItem() {}, removeItem() {} },
    { userAgent: 'node' },
    function Chart() {}, { createIcons() {} }, console,
  );
  // Resolve getters (deep) into plain JSON.
  const json = JSON.parse(JSON.stringify(bundle));
  write(resolve(ROOT, 'apps/api/prisma/seed-data.json'), JSON.stringify(json, null, 2) + '\n');
  write(resolve(ROOT, 'apps/web/src/prototype/seed-data.json'), JSON.stringify(json, null, 2) + '\n');
} catch (e) {
  console.error('Could not evaluate DATA bundle:', e.message);
  console.error('Engine source written anyway; seed will need a manual fallback.');
  process.exitCode = 1;
}
