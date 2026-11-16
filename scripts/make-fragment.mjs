// Turns the single-file build into a page fragment for the hosted preview
// (the host adds its own <html>/<head>/<body> skeleton).
import { readFileSync, writeFileSync } from 'node:fs';
const html = readFileSync('dist-single/index.html', 'utf8');
const head = html.match(/<head>([\s\S]*?)<\/head>/)[1];
const body = html.match(/<body>([\s\S]*?)<\/body>/)[1];
const keep = [];
keep.push('<title>Learnly</title>');
for (const m of head.matchAll(/<link[^>]*fonts\.googleapis\.com\/css2[^>]*>/g)) keep.push(m[0]);
for (const m of head.matchAll(/<style[\s\S]*?<\/style>/g)) keep.push(m[0]);
const scripts = [...head.matchAll(/<script[\s\S]*?<\/script>/g)].map((m) => m[0]);
const out = keep.join('\n') + '\n' + body.trim() + '\n' + scripts.join('\n') + '\n';
writeFileSync('dist-single/learnly.html', out);
console.log('fragment written', (out.length / 1024).toFixed(0) + ' KB');
