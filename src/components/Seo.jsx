import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const SITE_NAME = 'Pondok Pesantren Darussalam Panusupan';
const SITE_URL = 'https://ppds-panusupan.vercel.app';
const DEFAULT_DESCRIPTION =
  'Website resmi Pondok Pesantren Darussalam Panusupan yang memuat profil pesantren, program pendidikan, pengumuman, pendaftaran, dan artikel santri.';
const DEFAULT_IMAGE = '/header_ppds.webp';
const DEFAULT_KEYWORDS = [
  'pondok pesantren',
  'Darussalam Panusupan',
  'pesantren Banyumas',
  'pendidikan Islam',
  'pendaftaran santri',
  'pengumuman pesantren',
];

function upsertMeta(selector, attributes) {
  let element = document.head.querySelector(selector);

  if (!element) {
    element = document.createElement('meta');
    document.head.appendChild(element);
  }

  Object.entries(attributes).forEach(([key, value]) => {
    element.setAttribute(key, value);
  });
}

function upsertLink(rel, href) {
  let element = document.head.querySelector(`link[rel="${rel}"]`);

  if (!element) {
    element = document.createElement('link');
    element.setAttribute('rel', rel);
    document.head.appendChild(element);
  }

  element.setAttribute('href', href);
}

export function Seo({
  title,
  description = DEFAULT_DESCRIPTION,
  image = DEFAULT_IMAGE,
  type = 'website',
  keywords = DEFAULT_KEYWORDS,
  structuredData,
}) {
  const location = useLocation();

  useEffect(() => {
    const normalizedTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;
    const canonicalUrl = new URL(location.pathname + location.search, SITE_URL).toString();
    const imageUrl = new URL(image, SITE_URL).toString();

    document.title = normalizedTitle;
    document.documentElement.lang = 'id';

    upsertMeta('meta[name="description"]', { name: 'description', content: description });
    upsertMeta('meta[name="keywords"]', { name: 'keywords', content: keywords.join(', ') });
    upsertMeta('meta[name="robots"]', { name: 'robots', content: 'index, follow, max-image-preview:large' });
    upsertMeta('meta[name="theme-color"]', { name: 'theme-color', content: '#065f46' });
    upsertMeta('meta[property="og:type"]', { property: 'og:type', content: type });
    upsertMeta('meta[property="og:title"]', { property: 'og:title', content: normalizedTitle });
    upsertMeta('meta[property="og:description"]', { property: 'og:description', content: description });
    upsertMeta('meta[property="og:url"]', { property: 'og:url', content: canonicalUrl });
    upsertMeta('meta[property="og:site_name"]', { property: 'og:site_name', content: SITE_NAME });
    upsertMeta('meta[property="og:locale"]', { property: 'og:locale', content: 'id_ID' });
    upsertMeta('meta[property="og:image"]', { property: 'og:image', content: imageUrl });
    upsertMeta('meta[name="twitter:card"]', { name: 'twitter:card', content: 'summary_large_image' });
    upsertMeta('meta[name="twitter:title"]', { name: 'twitter:title', content: normalizedTitle });
    upsertMeta('meta[name="twitter:description"]', { name: 'twitter:description', content: description });
    upsertMeta('meta[name="twitter:image"]', { name: 'twitter:image', content: imageUrl });
    upsertLink('canonical', canonicalUrl);

    let schemaTag = document.head.querySelector('script[data-seo="structured-data"]');
    if (!schemaTag) {
      schemaTag = document.createElement('script');
      schemaTag.setAttribute('type', 'application/ld+json');
      schemaTag.setAttribute('data-seo', 'structured-data');
      document.head.appendChild(schemaTag);
    }

    const schemaPayload = structuredData || {
      '@context': 'https://schema.org',
      '@type': 'EducationalOrganization',
      name: SITE_NAME,
      url: SITE_URL,
      description,
      logo: new URL('/logo.webp', SITE_URL).toString(),
      image: imageUrl,
      sameAs: [],
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Kandang Aur RT 04 RW 02, Panusupan, Cilongok',
        addressLocality: 'Banyumas',
        addressRegion: 'Jawa Tengah',
        postalCode: '53162',
        addressCountry: 'ID',
      },
      contactPoint: {
        '@type': 'ContactPoint',
        telephone: '+62-811-263-0731',
        contactType: 'customer service',
        areaServed: 'ID',
      },
    };

    schemaTag.textContent = JSON.stringify(schemaPayload);
  }, [description, image, keywords, location.pathname, location.search, structuredData, title, type]);

  return null;
}
