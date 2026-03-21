import { useParams, Link } from 'react-router-dom';
import { PublicLayout } from '../components/PublicLayout';
import { useData } from '../contexts/DataContext';
import { ArrowLeft, Calendar } from 'lucide-react';
import { PublicRichTextRenderer } from '../components/ui/PublicRichTextRenderer';

export function PengumumanDetailPage() {
  const { id } = useParams();
  const { pengumuman } = useData();

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

  return (
    <PublicLayout>
      <div className="bg-emerald-800 text-white py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link to="/pengumuman" className="inline-flex items-center gap-1 text-emerald-200 hover:text-white text-sm mb-6">
            <ArrowLeft size={16} /> Kembali ke Pengumuman
          </Link>
          <div className="flex flex-wrap items-center gap-2 mb-3">
            {item.important && (
              <span className="text-xs font-semibold text-red-300 bg-red-500/30 px-2.5 py-0.5 rounded-full">Penting</span>
            )}
          </div>
          <h1 className="text-2xl md:text-4xl font-bold leading-tight mb-4">{item.title}</h1>
          <div className="flex items-center gap-2 text-emerald-200 text-sm">
            <Calendar size={14} />
            {new Date(item.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
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
