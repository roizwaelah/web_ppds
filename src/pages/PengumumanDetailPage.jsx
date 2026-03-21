import { useState } from 'react';
import { useLocation, useParams, Link } from 'react-router-dom';
import { PublicLayout } from '../components/PublicLayout';
import { useData } from '../contexts/DataContext';
import { ArrowLeft, Calendar, Check, Link2, MessageCircle } from 'lucide-react';
import { PublicRichTextRenderer } from '../components/ui/PublicRichTextRenderer';
import { createAnnouncementSeo } from '../utils/seo';

export function PengumumanDetailPage() {
  const { id } = useParams();
  const location = useLocation();
  const { pengumuman } = useData();
  const [copied, setCopied] = useState(false);

  if (!pengumuman) {
    return (
      <PublicLayout>
        <div className="max-w-4xl mx-auto px-4 py-20 text-center text-gray-500">Memuat konten...</div>
      </PublicLayout>
    );
  }

  const item = pengumuman.find((a) => String(a.id) === String(id));

  if (!item) {
    return (
      <PublicLayout>
        <div className="max-w-4xl mx-auto px-4 py-24 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Pengumuman tidak ditemukan</h1>
          <Link to="/pengumuman" className="text-emerald-600 hover:text-emerald-700 font-medium">
            ← Kembali ke Pengumuman
          </Link>
        </div>
      </PublicLayout>
    );
  }

  const seo = createAnnouncementSeo(item, location.pathname);
  const pageUrl = typeof window !== 'undefined' ? window.location.href : `https://ppds.local${location.pathname}`;
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`Pengumuman PPDS: ${item.title}\n${pageUrl}`)}`;
  const formattedDate = new Date(item.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

  const copyLink = async () => {
    if (typeof navigator === 'undefined' || !navigator.clipboard) return;
    await navigator.clipboard.writeText(pageUrl);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  return (
    <PublicLayout seo={seo}>
      <div className="bg-emerald-800 text-white py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link to="/pengumuman" className="inline-flex items-center gap-1 text-emerald-200 hover:text-white text-sm mb-6">
            <ArrowLeft size={16} /> Kembali ke Pengumuman
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
            <div className="lg:col-span-8">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                {item.important && (
                  <span className="text-xs font-semibold text-red-300 bg-red-500/30 px-2.5 py-0.5 rounded-full">Penting</span>
                )}
              </div>
              <h1 className="text-2xl md:text-4xl font-bold leading-tight mb-4">{item.title}</h1>
              <div className="flex items-center gap-2 text-emerald-200 text-sm">
                <Calendar size={14} />
                {formattedDate}
              </div>
            </div>

            <aside className="lg:col-span-4 w-full lg:flex lg:justify-end">
              <div className="inline-flex items-center gap-3 rounded-full border border-white/15 bg-white/10 px-3 py-2 backdrop-blur-sm">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Bagikan ke WhatsApp"
                  title="Bagikan ke WhatsApp"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#25D366] text-white transition-colors hover:bg-[#1fba57]"
                >
                  <MessageCircle size={18} />
                </a>
                <button
                  onClick={copyLink}
                  aria-label={copied ? 'Link disalin' : 'Salin link pengumuman'}
                  title={copied ? 'Link disalin' : 'Salin link pengumuman'}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-transparent text-white transition-colors hover:bg-white/10"
                >
                  {copied ? <Check size={18} /> : <Link2 size={18} />}
                </button>
              </div>
            </aside>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="bg-white rounded-2xl border border-gray-200 p-8 md:p-12">
          <PublicRichTextRenderer content={item.content} className="prose-lg max-w-none" />
        </div>
      </div>
    </PublicLayout>
  );
}
