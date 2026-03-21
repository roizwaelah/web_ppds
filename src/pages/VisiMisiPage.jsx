import { PublicLayout } from '../components/PublicLayout';
import { useData } from '../contexts/DataContext';
import { Eye, Target, CheckCircle } from 'lucide-react';

export function VisiMisiPage() {
  const { visiMisi, loading } = useData();

  if (loading) {
    return (
      <PublicLayout>
        <div className="max-w-4xl mx-auto px-4 py-20 text-center text-gray-500">Memuat konten...</div>
      </PublicLayout>
    );
  }

  const visiText = (visiMisi?.visi || '').trim();
  const misiItems = Array.isArray(visiMisi?.misi)
    ? visiMisi.misi.filter((item) => String(item || '').trim() !== '')
    : [];

  return (
    <PublicLayout>
      <div className="bg-emerald-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-3">Visi & Misi</h1>
          <p className="text-emerald-200">Arah dan tujuan Pondok Pesantren Darussalam</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        {/* Visi */}
        <div className="bg-gradient-to-br from-emerald-600 to-teal-600 rounded-2xl p-8 md:p-12 text-white mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-white/20 rounded-xl">
              <Eye size={28} />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold">Visi</h2>
          </div>
          <p className="text-lg md:text-xl leading-relaxed text-emerald-50">
            {visiText || 'Visi pesantren belum diatur.'}
          </p>
        </div>

        {/* Misi */}
        <div className="bg-white rounded-2xl border border-gray-200 p-8 md:p-12">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-emerald-100 rounded-xl">
              <Target size={28} className="text-emerald-600" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Misi</h2>
          </div>
          <div className="space-y-5">
            {misiItems.length === 0 ? (
              <p className="text-gray-500">Misi pesantren belum diatur.</p>
            ) : (
              misiItems.map((item, index) => (
                <div key={index} className="flex items-start gap-4">
                  <div className="shrink-0 mt-0.5">
                    <CheckCircle size={22} className="text-emerald-500" />
                  </div>
                  <p className="text-gray-700 leading-relaxed">{item}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
