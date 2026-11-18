const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

// Run after a Jekyll build. SITE_OUTPUT can point at a production build artifact.
const output = path.resolve(process.env.SITE_OUTPUT || path.join(__dirname, '..', '_site'));

function walk(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const filename = path.join(directory, entry.name);
    return entry.isDirectory() ? [filename, ...walk(filename)] : [filename];
  });
}

test('deployed output excludes internal instructions and development notes', () => {
  assert.ok(fs.existsSync(path.join(output, 'index.html')), 'Build the site before running this test');
  for (const filename of walk(output)) {
    const segments = path.relative(output, filename).split(path.sep);
    assert.ok(!segments.some(segment => /^(?:AGENTS|CLAUDE)(?:\.(?:md|markdown|html?))?$/i.test(segment)), filename);
    assert.ok(!['docs', '_tests', '.claude', '.superpowers'].includes(segments[0]), filename);
  }
});

test('sitemap contains public pages without internal URLs', () => {
  const xml = fs.readFileSync(path.join(output, 'sitemap.xml'), 'utf8');
  const locations = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => new URL(match[1]));
  assert.ok(locations.length > 0, 'Sitemap must contain public pages');
  for (const url of locations) {
    assert.ok(!/(?:^|\/)(?:AGENTS|CLAUDE)(?:\/|\.|$)/i.test(url.pathname), url.href);
    assert.ok(!/(?:^|\/)(?:docs|_tests|\.claude|\.superpowers)(?:\/|$)/.test(url.pathname), url.href);
  }
  for (const slug of ['pricing', 'features', 'case-studies', 'maintenance-assessment', 'shire-system-alternative']) {
    assert.ok(locations.some(url => url.pathname.endsWith(`/${slug}/`)), slug);
  }
});

test('public AI context files remain published', () => {
  for (const filename of ['llms.txt', 'llms-full.txt']) {
    const content = fs.readFileSync(path.join(output, filename), 'utf8');
    assert.match(content, /^# Smartspanner/);
    assert.ok(!content.includes('{{') && !content.includes('{%'), filename);
  }
});

test('the Seras case study is available by its direct URL only', () => {
  const slug = 'seras-80d1378311a9b8d9bf4a34ff';
  const pagePath = path.join(output, 'case-studies', slug, 'index.html');
  const page = fs.readFileSync(pagePath, 'utf8');
  assert.match(page, /<meta name="robots" content="noindex, nofollow">/);
  assert.match(page, /<h1>How Seras is bringing maintenance together across seven sites with Smartspanner<\/h1>/);
  assert.match(page, /href="[^"]*\/book-a-demo\/"[^>]*>Book a Demo<\/a>/);

  for (const filename of walk(output)) {
    if (filename === pagePath || !/\.(html|xml|txt|json)$/i.test(filename) || !fs.statSync(filename).isFile()) continue;
    assert.ok(!fs.readFileSync(filename, 'utf8').includes(slug), filename);
  }
});
