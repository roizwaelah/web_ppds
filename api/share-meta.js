import fs from 'node:fs';
import path from 'node:path';

const SITE_NAME = 'Pondok Pesantren Darussalam Panusupan';
const SITE_URL = 'https://ppds-panusupan.vercel.app';
const DEFAULT_DESCRIPTION = 'Website resmi Pondok Pesantren Darussalam Panusupan yang memuat profil pesantren, program pendidikan, pengumuman, pendaftaran, dan artikel santri.';
const DEFAULT_IMAGE = '/header_ppds.webp';

function escapeHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function slugifyTitle(value = '') {
  return String(value)
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-') || 'item';
}

function stripHtml(html = '') {
  return String(html)
    .replace(/<(br|\/p|\/li|\/ol|\/ul|\/h[1-6])>/gi, '\n')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeImage(url) {
  if (!url) return new URL(DEFAULT_IMAGE, SITE_URL).toString();
  const normalized = String(url).trim();
  if (!normalized) return new URL(DEFAULT_IMAGE, SITE_URL).toString();
  if (/^https?:\/\//i.test(normalized)) return normalized;
  if (normalized.startsWith('/')) return new URL(normalized, SITE_URL).toString();
  if (normalized.startsWith('uploads/')) return new URL(`/${normalized}`, SITE_URL).toString();
  if (!normalized.includes('/')) return new URL(`/uploads/${normalized}`, SITE_URL).toString();
  return new URL(DEFAULT_IMAGE, SITE_URL).toString();
}

async function fetchJson(url) {
  const response = await fetch(url, { headers: { accept: 'application/json' } });
  if (!response.ok) throw new Error(`Failed to fetch ${url}: ${response.status}`);
  return response.json();
}

function readIndexHtml() {
  const candidates = [
    path.join(process.cwd(), 'dist', 'index.html'),
    path.join(process.cwd(), 'index.html'),
  ];

  for (const file of candidates) {
    if (fs.existsSync(file)) {
      return fs.readFileSync(file, 'utf8');
    }
  }

  throw new Error('index.html not found');
}

function injectMeta(html, meta) {
  const titleTag = `<title>${escapeHtml(meta.title)}</title>`;
  const metaBlock = `
    <meta name="description" content="${escapeHtml(meta.description)}" />
    <meta name="theme-color" content="#065f46" />
    <meta name="robots" content="index, follow, max-image-preview:large" />
    <meta property="og:type" content="${escapeHtml(meta.type || 'article')}" />
    <meta property="og:title" content="${escapeHtml(meta.title)}" />
    <meta property="og:description" content="${escapeHtml(meta.description)}" />
    <meta property="og:url" content="${escapeHtml(meta.url)}" />
    <meta property="og:site_name" content="${escapeHtml(SITE_NAME)}" />
    <meta property="og:locale" content="id_ID" />
    <meta property="og:image" content="${escapeHtml(meta.image)}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(meta.title)}" />
    <meta name="twitter:description" content="${escapeHtml(meta.description)}" />
    <meta name="twitter:image" content="${escapeHtml(meta.image)}" />
    <link rel="canonical" href="${escapeHtml(meta.url)}" />`;

  return html
    .replace(/<title>[\s\S]*?<\/title>/i, titleTag)
    .replace(/<meta name="description"[^>]*>/i, '')
    .replace(/<meta name="robots"[^>]*>/i, '')
    .replace(/<link rel="canonical"[^>]*>/i, '')
    .replace('</head>', `${metaBlock}\n  </head>`);
}

async function resolveMeta(pathname, origin) {
  const articlePrefix = '/pojok-santri/';
  const announcementPrefix = '/pengumuman/';
  const pageUrl = new URL(pathname, origin).toString();

  if (pathname.startsWith(articlePrefix)) {
    const slug = decodeURIComponent(pathname.slice(articlePrefix.length)).trim().toLowerCase();
    const response = await fetchJson(`${origin}/api/pojok_santri.php?page=1&limit=100&status=published`);
    const items = Array.isArray(response?.data) ? response.data : [];
    const article = items.find((item) => String(item?.id) === slug || slugifyTitle(item?.title) === slug);

    if (article) {
      const description = stripHtml(article.content || '').slice(0, 155) || 'Baca artikel terbaru dari santri Pondok Pesantren Darussalam Panusupan.';
      return {
        title: `${article.title} | ${SITE_NAME}`,
        description,
        image: normalizeImage(article.image),
        url: pageUrl,
        type: 'article',
      };
    }
  }

  if (pathname.startsWith(announcementPrefix)) {
    const slug = decodeURIComponent(pathname.slice(announcementPrefix.length)).trim().toLowerCase();
    const response = await fetchJson(`${origin}/api/pengumuman.php?limit=100`);
    const items = Array.isArray(response?.data) ? response.data : [];
    const item = items.find((entry) => String(entry?.id) === slug || slugifyTitle(entry?.title) === slug);

    if (item) {
      const description = stripHtml(item.content || '').slice(0, 155) || 'Informasi pengumuman resmi Pondok Pesantren Darussalam Panusupan.';
      return {
        title: `${item.title} | ${SITE_NAME}`,
        description,
        image: new URL(DEFAULT_IMAGE, SITE_URL).toString(),
        url: pageUrl,
        type: 'article',
      };
    }
  }

  return {
    title: SITE_NAME,
    description: DEFAULT_DESCRIPTION,
    image: new URL(DEFAULT_IMAGE, SITE_URL).toString(),
    url: pageUrl,
    type: 'website',
  };
}

function getRequestPath(req) {
  const host = req.headers.host || 'ppds-panusupan.vercel.app';
  const proto = req.headers['x-forwarded-proto'] || 'https';
  const requestUrl = new URL(req.url || '/', `${proto}://${host}`);
  const rewrittenPath = requestUrl.searchParams.get('path');

  if (rewrittenPath && rewrittenPath.startsWith('/')) {
    return rewrittenPath;
  }

  return requestUrl.pathname;
}

export default async function handler(req, res) {
  try {
    const host = req.headers.host || 'ppds-panusupan.vercel.app';
    const proto = req.headers['x-forwarded-proto'] || 'https';
    const origin = `${proto}://${host}`;
    const pathname = getRequestPath(req);
    const html = readIndexHtml();
    const meta = await resolveMeta(pathname, origin);
    const output = injectMeta(html, meta);

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.status(200).send(output);
  } catch (error) {
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.status(500).send(`Failed to render share metadata: ${error.message}`);
  }
}
