// Extracts individual top-level object/array literals from the prototype by
// brace-matching, then evaluates each in isolation (DATA getters only use
// `this`, so no cross-references are needed). Output -> seed-data.json.
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const ROOT = resolve(process.cwd());
const html = readFileSync(
  resolve(ROOT, '_design_extracted/dashboard-project/project/Dashboard Kinerja PUSMANPRO v3.html'),
  'utf8',
);

function sliceLiteral(name) {
  const decl = new RegExp(`const\\s+${name}\\s*=\\s*`).exec(html);
  if (!decl) return null;
  let i = decl.index + decl[0].length;
  const open = html[i];
  const close = open === '{' ? '}' : ']';
  let depth = 0, inStr = false, q = '', esc = false;
  const start = i;
  for (; i < html.length; i++) {
    const ch = html[i];
    if (esc) { esc = false; continue; }
    if (inStr) {
      if (ch === '\\') { esc = true; continue; }
      if (ch === q) inStr = false;
      continue;
    }
    // Skip line comments: // ...
    if (ch === '/' && html[i + 1] === '/') {
      while (i < html.length && html[i] !== '\n') i++;
      continue;
    }
    // Skip block comments: /* ... */
    if (ch === '/' && html[i + 1] === '*') {
      i += 2;
      while (i < html.length - 1 && !(html[i] === '*' && html[i + 1] === '/')) i++;
      i++; // skip closing /
      continue;
    }
    if (ch === '"' || ch === "'" || ch === '`') { inStr = true; q = ch; continue; }
    if (ch === open) depth++;
    else if (ch === close) { depth--; if (depth === 0) { i++; break; } }
  }
  return html.slice(start, i).replace(/;\s*$/, '');
}

// Strip ES getter shorthand: `get propName() { ... }` -> `propName: (function() { ... }).call(this)`
// This lets us wrap the literal in `return (...)` without syntax errors.
function stripGetters(src) {
  // Match: get <name>() { <body> } where body is brace-balanced
  return src.replace(/\bget\s+(\w+)\s*\(\)\s*\{/g, (match, name, offset) => {
    // We need to find the matching closing brace for the getter body.
    // Replace the getter head with a regular property: `name: function() {`
    return `${name}: function() {`;
  }).replace(/,(\s*)\}/g, (m, ws, offset, str) => m); // keep trailing commas as-is
}

// A safer approach: use regex to rewrite getter syntax to regular method syntax,
// then call it on the object after construction. But the simplest fix is to just
// strip getters entirely from the object and handle them post-eval.
function evalLiteral(name, lit) {
  // Replace getter declarations with regular function properties
  // `get propName() {` -> `propName: function() {`
  const stripped = lit.replace(/\bget\s+(\w+)\s*\(\)\s*\{/g, '$1: function() {');
  try {
    // eslint-disable-next-line no-new-func
    const obj = new Function(`return (${stripped});`)();
    // Now call any function-valued properties that were getters, binding to obj
    // so `this` refers to the object. Walk the object to find them.
    // For DATA, the getters use `this` to reference sibling properties.
    // We resolve them by calling with obj as `this`.
    function resolveGetterFunctions(o, root) {
      if (!o || typeof o !== 'object') return o;
      for (const key of Object.keys(o)) {
        if (typeof o[key] === 'function') {
          try { o[key] = o[key].call(root || o); } catch (_) { o[key] = null; }
        } else if (typeof o[key] === 'object' && o[key] !== null) {
          resolveGetterFunctions(o[key], root || o);
        }
      }
      return o;
    }
    resolveGetterFunctions(obj, obj);
    return obj;
  } catch (e) {
    throw e;
  }
}

const names = ['DATA', 'ROLES', 'ROUTES', 'ROLE_TO_STAGE', 'ICONS_BY_TYPE', 'KPI_DEEPDIVE_DATA'];
const out = {};
for (const n of names) {
  const lit = sliceLiteral(n);
  if (!lit) { console.warn('!! not found:', n); continue; }
  try {
    const val = evalLiteral(n, lit);
    out[n] = JSON.parse(JSON.stringify(val)); // resolve getters deeply
    console.log('ok', n, '-', lit.length, 'chars');
  } catch (e) {
    console.error('!! eval failed', n, e.message);
    process.exitCode = 1;
  }
}
writeFileSync(resolve(ROOT, 'apps/api/prisma/seed-data.json'), JSON.stringify(out, null, 2) + '\n');
writeFileSync(resolve(ROOT, 'apps/web/src/prototype/seed-data.json'), JSON.stringify(out, null, 2) + '\n');
console.log('seed-data.json written');
