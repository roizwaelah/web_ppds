import { useMemo, useState } from 'react';
import { useLocation, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, User, Clock3, Link2, Check, Download } from 'lucide-react';
import { PublicLayout } from '../components/PublicLayout';
import { useData } from '../contexts/DataContext';
import { PublicRichTextRenderer } from '../components/ui/PublicRichTextRenderer';
import { stripHTML } from '../utils/text';
import { createArticleSeo } from '../utils/seo';

const FALLBACK_IMAGE = 'https://placehold.co/1200x675?text=Pojok+Santri';

function toSafeImage(url) {
  if (!url) return FALLBACK_IMAGE;
  const normalized = String(url).trim();
  if (!normalized) return FALLBACK_IMAGE;

  if (/^https?:\/\//i.test(normalized)) return normalized;
  if (normalized.startsWith('/uploads/')) return normalized;
  if (normalized.startsWith('uploads/')) return `/${normalized}`;
  if (!normalized.includes('/')) return `/uploads/${normalized}`;
  if (normalized.startsWith('/')) return normalized;

  return FALLBACK_IMAGE;
}

function formatDate(value) {
  const date = value ? new Date(value) : null;
  if (!date || Number.isNaN(date.getTime())) return '-';
  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function estimateReadTime(content = '') {
  const words = stripHTML(content).trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(words / 200));
  return `${minutes} menit baca`;
}

function WhatsAppIcon(props) {
  return (
    <svg viewBox="0 0 32 32" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M19.11 17.21c-.27-.13-1.6-.79-1.85-.88-.25-.09-.43-.13-.61.13-.18.27-.7.88-.86 1.06-.16.18-.31.2-.58.07-.27-.13-1.13-.42-2.15-1.33-.8-.71-1.34-1.59-1.5-1.86-.16-.27-.02-.41.11-.54.12-.12.27-.31.4-.47.13-.16.18-.27.27-.45.09-.18.04-.34-.02-.47-.07-.13-.61-1.48-.84-2.03-.22-.53-.44-.46-.61-.47l-.52-.01c-.18 0-.47.07-.72.34-.25.27-.95.93-.95 2.27 0 1.34.98 2.64 1.11 2.82.13.18 1.91 2.92 4.62 4.1.64.28 1.14.45 1.53.58.64.2 1.22.17 1.68.1.51-.08 1.6-.65 1.82-1.28.22-.62.22-1.16.16-1.28-.07-.12-.25-.2-.52-.33Z" />
      <path d="M16.01 3.2c-7.07 0-12.8 5.73-12.8 12.8 0 2.25.58 4.37 1.6 6.22L3.2 28.8l6.76-1.57a12.75 12.75 0 0 0 6.05 1.53h.01c7.07 0 12.8-5.73 12.8-12.8 0-3.43-1.34-6.65-3.77-9.08A12.7 12.7 0 0 0 16.01 3.2Zm0 23.4h-.01c-1.89 0-3.74-.51-5.36-1.47l-.38-.23-4.01.93.96-3.91-.25-.4a10.58 10.58 0 0 1-1.63-5.63c0-5.87 4.78-10.65 10.66-10.65 2.84 0 5.5 1.1 7.51 3.11a10.54 10.54 0 0 1 3.12 7.53c0 5.88-4.78 10.66-10.65 10.66Z" />
    </svg>
  );
}

export function PojokSantriDetailPage() {
  const { id } = useParams();
  const location = useLocation();
  const { pojokSantri } = useData();
  const [copied, setCopied] = useState(false);

  const publishedList = useMemo(() => {
    const list = Array.isArray(pojokSantri) ? pojokSantri : [];
    return list.filter((item) => (item.status || 'published') === 'published');
  }, [pojokSantri]);

  const article = useMemo(
    () => publishedList.find((item) => String(item.id) === String(id)),
    [publishedList, id]
  );

  const related = useMemo(
    () => publishedList.filter((item) => String(item.id) !== String(id)).slice(0, 6),
    [publishedList, id]
  );

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  const whatsappShareUrl = `https://wa.me/?text=${encodeURIComponent(`Baca artikel ${article?.title || ''} di ${shareUrl}`)}`;

  const handleDownloadPdf = () => {
    if (typeof window === 'undefined') return;

    const printableContent = `<!doctype html>
<html lang="id">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${article?.title || 'Artikel Pojok Santri'}</title>
    <style>
      body { font-family: Arial, sans-serif; padding: 32px; color: #0f172a; line-height: 1.7; }
      img { display: block; max-width: 100%; height: auto; border-radius: 12px; margin: 0 0 24px; }
      h1 { font-size: 32px; margin-bottom: 8px; }
      .meta { color: #475569; font-size: 14px; margin-bottom: 24px; }
      .content { font-size: 16px; }
      .content a { color: #047857; }
    </style>
  </head>
  <body>
    <h1>${article?.title || ''}</h1>
    <div class="meta">${article?.author || 'Tim Redaksi'} • ${formatDate(article?.date || article?.created_at)}</div>
    ${article?.image ? `<img src="${toSafeImage(article.image)}" alt="${article.title || ''}" />` : ''}
    <div class="content">${article?.content || ''}</div>
    <script>
      window.addEventListener('load', () => {
        setTimeout(() => {
          window.focus();
          window.print();
        }, 300);
      });
      window.addEventListener('afterprint', () => window.close());
    <\/script>
  </body>
</html>`;

    const htmlBlob = new Blob([printableContent], { type: 'text/html' });
    const htmlUrl = URL.createObjectURL(htmlBlob);
    const printWindow = window.open(htmlUrl, '_blank');

    if (!printWindow) {
      URL.revokeObjectURL(htmlUrl);
      return;
    }

    const revokeUrl = () => URL.revokeObjectURL(htmlUrl);
    printWindow.addEventListener('load', revokeUrl, { once: true });
    setTimeout(revokeUrl, 60000);
  };

  if (!pojokSantri) {
    return (
      <PublicLayout>
        <div className="max-w-4xl mx-auto px-4 py-24 text-center text-gray-500">Memuat konten...</div>
      </PublicLayout>
    );
  }

  if (!article) {
    return (
      <PublicLayout>
        <div className="max-w-4xl mx-auto px-4 py-24 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Artikel tidak ditemukan</h1>
          <Link to="/pojok-santri" className="text-emerald-700 hover:text-emerald-800 font-medium">
            Kembali ke Pojok Santri
          </Link>
        </div>
      </PublicLayout>
    );
  }

  const seo = createArticleSeo(article, location.pathname);

  return (
    <PublicLayout seo={seo}>
      <section className="border-b border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
          <Link to="/pojok-santri" className="inline-flex items-center gap-1 text-sm text-emerald-700 hover:text-emerald-800 font-semibold">
            <ArrowLeft size={16} /> Kembali ke Pojok Santri
          </Link>

          <p className="mt-5 text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-700">Pojok Santri</p>
          <h1 className="mt-2 text-2xl md:text-4xl font-black text-slate-900 leading-tight max-w-5xl">
            {article.title}
          </h1>

          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-600">
            <span className="inline-flex items-center gap-1"><User size={14} /> {article.author || 'Tim Redaksi'}</span>
            <span className="inline-flex items-center gap-1"><Calendar size={14} /> {formatDate(article.date || article.created_at)}</span>
            <span className="inline-flex items-center gap-1"><Clock3 size={14} /> {estimateReadTime(article.content)}</span>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10 grid grid-cols-1 lg:grid-cols-12 gap-8">
        <article className="lg:col-span-8">
          <div className="rounded-xl overflow-hidden border border-slate-200 bg-white">
            <img
              src={toSafeImage(article.image)}
              alt={article.title}
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = FALLBACK_IMAGE;
              }}
              className="w-full h-56 sm:h-72 md:h-[420px] object-cover"
            />
            <div className="p-5 md:p-8">
              <div className="max-w-none prose prose-slate prose-lg prose-headings:font-black prose-a:text-emerald-700 hover:prose-a:text-emerald-800 prose-img:rounded-lg">
                <PublicRichTextRenderer content={article.content} />
              </div>
            </div>
          </div>
        </article>

        <aside className="lg:col-span-4">
          <div className="lg:sticky lg:top-24 space-y-5">
            <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
              <div className="px-4 py-3 bg-emerald-700 text-white">
                <h3 className="text-sm font-bold uppercase tracking-wider">Bagikan</h3>
              </div>
              <div className="p-4 flex items-center gap-3">
                <a
                  href={whatsappShareUrl}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Bagikan ke WhatsApp"
                  title="Bagikan ke WhatsApp"
                  className="inline-flex h-11 w-11 items-center justify-center rounded-md bg-[#25D366] text-white hover:bg-[#1fb85a] transition-colors"
                >
                  <WhatsAppIcon className="h-[18px] w-[18px]" />
                </a>
                <button
                  onClick={handleDownloadPdf}
                  aria-label="Download PDF"
                  title="Download PDF"
                  className="inline-flex h-11 w-11 items-center justify-center rounded-md border border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 transition-colors"
                >
                  <Download size={18} />
                </button>
                <button
                  onClick={copyLink}
                  aria-label={copied ? 'Link disalin' : 'Salin link artikel'}
                  title={copied ? 'Link disalin' : 'Salin link artikel'}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-md border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  {copied ? <Check size={18} /> : <Link2 size={18} />}
                </button>
              </div>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
              <div className="px-4 py-3 bg-emerald-50 border-b border-emerald-100">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700">Artikel Terkait</h3>
              </div>
              <div className="divide-y divide-slate-200">
                {related.map((item) => (
                  <Link key={item.id} to={`/pojok-santri/${item.id}`} className="block p-4 hover:bg-slate-50 transition-colors">
                    <p className="text-[11px] uppercase tracking-wider font-semibold text-emerald-700">
                      {item.category || 'Artikel'}
                    </p>
                    <h4 className="mt-1 text-sm font-bold text-slate-900 line-clamp-2 hover:text-emerald-700">
                      {item.title}
                    </h4>
                    <p className="mt-1 text-xs text-slate-500">{formatDate(item.date || item.created_at)}</p>
                  </Link>
                ))}
                {related.length === 0 && (
                  <div className="p-4 text-sm text-slate-500">Belum ada artikel terkait.</div>
                )}
              </div>
            </div>
          </div>
        </aside>
      </section>
    </PublicLayout>
  );
}
