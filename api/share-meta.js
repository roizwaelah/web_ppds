import fs from 'node:fs';
import path from 'node:path';

const SITE_NAME = 'Pondok Pesantren Darussalam Panusupan';
const SITE_URL = 'https://darussalamanusupan.net';
const DEFAULT_DESCRIPTION = 'Website resmi Pondok Pesantren Darussalam Panusupan yang memuat profil pesantren, program pendidikan, pengumuman, pendaftaran, dan artikel santri.';
const DEFAULT_IMAGE = '/header_ppds.webp';
const DEFAULT_IMAGE_WIDTH = '1200';
const DEFAULT_IMAGE_HEIGHT = '630';

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
  if (!normalized || normalized.startsWith('data:')) return new URL(DEFAULT_IMAGE, SITE_URL).toString();
  if (/^https?:\/\//i.test(normalized)) return normalized.replace(/^http:\/\//i, 'https://');
  if (normalized.startsWith('//')) return `https:${normalized}`;
  if (normalized.startsWith('/')) return new URL(normalized, SITE_URL).toString();
  if (normalized.startsWith('uploads/')) return new URL(`/${normalized}`, SITE_URL).toString();
  if (!normalized.includes('/')) return new URL(`/uploads/${normalized}`, SITE_URL).toString();
  return new URL(DEFAULT_IMAGE, SITE_URL).toString();
}

function extractContentImage(html = '') {
  const imgMatches = String(html).matchAll(/<img[^>]+src=["']([^"']+)["'][^>]*>/gi);
  for (const match of imgMatches) {
    const candidate = String(match?.[1] || '').trim();
    if (!candidate) continue;
    return candidate;
  }
  return '';
}

async function fetchJson(url) {
  const response = await fetch(url, { headers: { accept: 'application/json' } });
  if (!response.ok) throw new Error(`Failed to fetch ${url}: ${response.status}`);
  return response.json();
}


async function findPagedItem(fetchPage, matcher) {
  let page = 1;
  let totalPages = 1;

  while (page <= totalPages) {
    const response = await fetchPage(page);
    const items = Array.isArray(response?.data) ? response.data : [];
    const match = items.find(matcher);

    if (match) {
      return match;
    }

    const total = Number(response?.total || 0);
    const limit = Number(response?.limit || items.length || 1);
    totalPages = total > 0 ? Math.ceil(total / limit) : (items.length === limit ? page + 1 : page);

    if (items.length < limit) {
      break;
    }

    page += 1;
  }

  return null;
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
  const imageAlt = meta.imageAlt || meta.title;
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
    <meta property="og:image:url" content="${escapeHtml(meta.image)}" />
    <meta property="og:image:secure_url" content="${escapeHtml(meta.image)}" />
    <meta property="og:image:width" content="${escapeHtml(meta.imageWidth || DEFAULT_IMAGE_WIDTH)}" />
    <meta property="og:image:height" content="${escapeHtml(meta.imageHeight || DEFAULT_IMAGE_HEIGHT)}" />
    <meta property="og:image:alt" content="${escapeHtml(imageAlt)}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(meta.title)}" />
    <meta name="twitter:description" content="${escapeHtml(meta.description)}" />
    <meta name="twitter:url" content="${escapeHtml(meta.url)}" />
    <meta name="twitter:image" content="${escapeHtml(meta.image)}" />
    <meta name="twitter:image:alt" content="${escapeHtml(imageAlt)}" />
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
    const article = await findPagedItem(
      (page) => fetchJson(`${origin}/api/pojok_santri.php?page=${page}&limit=50&status=published`),
      (item) => String(item?.id) === slug || slugifyTitle(item?.title) === slug,
    );

    if (article) {
      const description = stripHtml(article.content || '').slice(0, 155) || 'Baca artikel terbaru dari santri Pondok Pesantren Darussalam Panusupan.';
      return {
        title: `${article.title} | ${SITE_NAME}`,
        description,
        image: normalizeImage(article.image || extractContentImage(article.content)),
        imageAlt: article.title,
        url: pageUrl,
        type: 'article',
      };
    }
  }

  if (pathname.startsWith(announcementPrefix)) {
    const slug = decodeURIComponent(pathname.slice(announcementPrefix.length)).trim().toLowerCase();
    const item = await findPagedItem(
      (page) => fetchJson(`${origin}/api/pengumuman.php?page=${page}&limit=50`),
      (entry) => String(entry?.id) === slug || slugifyTitle(entry?.title) === slug,
    );

    if (item) {
      const description = stripHtml(item.content || '').slice(0, 155) || 'Informasi pengumuman resmi Pondok Pesantren Darussalam Panusupan.';
      return {
        title: `${item.title} | ${SITE_NAME}`,
        description,
        image: normalizeImage(item.image || extractContentImage(item.content)),
        imageAlt: item.title,
        url: pageUrl,
        type: 'article',
      };
    }
  }

  return {
    title: SITE_NAME,
    description: DEFAULT_DESCRIPTION,
    image: new URL(DEFAULT_IMAGE, SITE_URL).toString(),
    imageAlt: SITE_NAME,
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
