export const FALLBACK_PREVIEW_IMAGE = '/header_ppds.webp';

export function extractFirstImageSource(html = '') {
  if (!html) return '';

  const imgMatches = String(html).matchAll(/<img[^>]+src=["']([^"']+)["'][^>]*>/gi);

  for (const match of imgMatches) {
    const candidate = String(match?.[1] || '').trim();
    if (!candidate) continue;
    return candidate;
  }

  return '';
}

export function normalizePreviewImage(url) {
  if (!url) return FALLBACK_PREVIEW_IMAGE;

  const normalized = String(url).trim();

  if (!normalized || normalized.startsWith('data:')) return FALLBACK_PREVIEW_IMAGE;
  if (/^https?:\/\//i.test(normalized)) return normalized.replace(/^http:\/\//i, 'https://');
  if (normalized.startsWith('//')) return `https:${normalized}`;
  if (normalized.startsWith('/')) return normalized;
  if (normalized.startsWith('uploads/')) return `/${normalized}`;
  if (!normalized.includes('/')) return `/uploads/${normalized}`;

  return FALLBACK_PREVIEW_IMAGE;
}

export function getPreviewImage(...candidates) {
  for (const candidate of candidates) {
    const normalized = normalizePreviewImage(candidate);
    if (normalized !== FALLBACK_PREVIEW_IMAGE) return normalized;
  }

  return FALLBACK_PREVIEW_IMAGE;
}
