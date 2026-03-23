export function slugifyTitle(value = '') {
  return String(value)
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-') || 'item';
}

export function getPojokSantriPath(article) {
  return `/pojok-santri/${slugifyTitle(article?.title)}`;
}

export function getPengumumanPath(item) {
  return `/pengumuman/${slugifyTitle(item?.title)}`;
}

export function matchesTitleSlug(item, slug) {
  const normalizedSlug = decodeURIComponent(String(slug || '')).trim().toLowerCase();
  if (!normalizedSlug) return false;

  return String(item?.id) === normalizedSlug || slugifyTitle(item?.title) === normalizedSlug;
}
