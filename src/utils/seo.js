import { stripHTML } from './text';

const routeSeo = {
  '/': {
    title: 'Beranda',
    description:
      'Kenali Pondok Pesantren Darussalam Panusupan melalui profil, program pendidikan, pengumuman terbaru, dan informasi pendaftaran santri baru.',
  },
  '/profil/sekilas-pandang': {
    title: 'Sekilas Pandang',
    description:
      'Pelajari sejarah singkat, gambaran umum, dan keunggulan Pondok Pesantren Darussalam Panusupan.',
  },
  '/profil/visi-misi': {
    title: 'Visi dan Misi',
    description:
      'Baca visi dan misi Pondok Pesantren Darussalam Panusupan sebagai dasar pembinaan santri yang berakhlak dan berilmu.',
  },
  '/profil/pengasuh': {
    title: 'Pengasuh dan Pengajar',
    description:
      'Kenali pengasuh dan tenaga pendidik Pondok Pesantren Darussalam Panusupan yang membimbing santri setiap hari.',
  },
  '/pendidikan': {
    title: 'Program Pendidikan',
    description:
      'Temukan informasi pendidikan formal, nonformal, ekstrakurikuler, dan jadwal kegiatan santri di Pondok Pesantren Darussalam Panusupan.',
  },
  '/pojok-santri': {
    title: 'Pojok Santri',
    description:
      'Baca artikel, cerita, dan karya terbaru dari santri Pondok Pesantren Darussalam Panusupan.',
  },
  '/pengumuman': {
    title: 'Pengumuman',
    description:
      'Akses pengumuman resmi, agenda penting, dan informasi terbaru dari Pondok Pesantren Darussalam Panusupan.',
  },
  '/pendaftaran': {
    title: 'Pendaftaran Santri Baru',
    description:
      'Dapatkan informasi pendaftaran, persyaratan, jadwal, dan tautan penting untuk calon santri baru Pondok Pesantren Darussalam Panusupan.',
  },
};

export function getDefaultSeo(pathname) {
  if (pathname.startsWith('/pojok-santri/')) {
    return {
      title: 'Detail Artikel Pojok Santri',
      description: 'Baca artikel lengkap santri beserta informasi penulis dan artikel terkait.',
    };
  }

  if (pathname.startsWith('/pengumuman/')) {
    return {
      title: 'Detail Pengumuman',
      description: 'Baca detail pengumuman resmi dari Pondok Pesantren Darussalam Panusupan.',
    };
  }

  return routeSeo[pathname] || {
    title: 'Website Resmi',
    description:
      'Website resmi Pondok Pesantren Darussalam Panusupan untuk profil, pendidikan, pengumuman, dan pendaftaran.',
  };
}

export function createArticleSeo(article, pathname) {
  if (!article) return null;

  const description = stripHTML(article.content || '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 155);

  return {
    title: article.title,
    description: description || 'Baca artikel terbaru dari santri Pondok Pesantren Darussalam Panusupan.',
    image: article.image || '/header_ppds.webp',
    type: 'article',
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: article.title,
      description: description || article.title,
      image: article.image || '/header_ppds.webp',
      author: {
        '@type': 'Person',
        name: article.author || 'Tim Redaksi',
      },
      publisher: {
        '@type': 'Organization',
        name: 'Pondok Pesantren Darussalam Panusupan',
        logo: {
          '@type': 'ImageObject',
          url: '/logo.webp',
        },
      },
      mainEntityOfPage: pathname,
      datePublished: article.date || article.created_at,
    },
  };
}

export function createAnnouncementSeo(item, pathname) {
  if (!item) return null;

  const description = stripHTML(item.content || '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 155);

  return {
    title: item.title,
    description: description || 'Informasi pengumuman resmi Pondok Pesantren Darussalam Panusupan.',
    type: 'article',
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'NewsArticle',
      headline: item.title,
      description: description || item.title,
      datePublished: item.date,
      mainEntityOfPage: pathname,
      publisher: {
        '@type': 'Organization',
        name: 'Pondok Pesantren Darussalam Panusupan',
      },
    },
  };
}
