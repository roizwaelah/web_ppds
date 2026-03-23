import { Link } from 'react-router-dom';
import { ArrowRight, Megaphone, Calendar, AlertCircle } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { PublicRichTextRenderer } from './ui/PublicRichTextRenderer';
import { getPengumumanPath } from '../utils/slugs';

export function Pengumuman() {
  const { pengumuman } = useData();

  return (
    <section className="pt-16 md:py-8 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Pengumuman</h2>
            <p className="text-gray-600">Informasi dan pengumuman terbaru.</p>
          </div>
          <Link
            to="/pengumuman"
            className="hidden md:inline-flex items-center gap-1 text-emerald-600 font-medium hover:text-emerald-700"
          >
            Lihat Semua <ArrowRight size={16} />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {pengumuman.slice(0, 3).map((item) => (
            <Link
              key={item.id}
              to={getPengumumanPath(item)}
              className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all hover:-translate-y-1 group flex flex-col"
            >
              <div className={`h-2 ${item.important ? 'bg-red-500' : 'bg-emerald-500'}`} />
              <div className="p-6 flex flex-col flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <Calendar size={14} className="text-gray-400" />
                  <span className="text-sm text-gray-400">
                    {new Date(item.date).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </span>
                  {item.important && (
                    <span className="ml-auto flex items-center gap-1 text-xs font-semibold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
                      <AlertCircle size={12} />
                      Penting
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-bold text-gray-900 group-hover:text-emerald-700 transition-colors mb-3 line-clamp-2">
                  {item.title}
                </h3>
                {item.content ? (
                  <PublicRichTextRenderer
                    content={item.content}
                    className="text-sm text-gray-500 line-clamp-3 flex-1 [&_p]:my-0 [&_p]:leading-6"
                  />
                ) : (
                  <p className="text-gray-500 text-sm line-clamp-3 flex-1">Klik untuk membaca selengkapnya.</p>
                )}
                <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-1 text-emerald-600 text-sm font-medium group-hover:gap-2 transition-all">
                  Baca Selengkapnya <ArrowRight size={14} />
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-8 text-center md:hidden">
          <Link
            to="/pengumuman"
            className="inline-flex items-center gap-1 text-emerald-600 font-medium"
          >
            Lihat Semua <ArrowRight size={16} />
          </Link>
        </div>

        {/* CTA */}
        <div className="mt-8 bg-emerald-700 rounded-2xl p-8 md:p-12 text-white text-center">
          <Megaphone size={48} className="mx-auto mb-6 text-yellow-300" />
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Pendaftaran Santri Baru Dibuka!</h2>
          <p className="text-emerald-100 text-lg mb-8 max-w-2xl mx-auto">
            Mari bergabung bersama kami untuk menempuh perjalanan menuntut ilmu yang penuh berkah.
            Pendaftaran periode 2026/2027 telah dibuka.
          </p>
          <Link
            to="/pendaftaran"
            className="inline-flex items-center gap-2 px-8 py-4 bg-yellow-400 text-emerald-900 font-bold rounded-xl hover:bg-yellow-300 transition-colors text-lg"
          >
            Daftar Sekarang <ArrowRight size={20} />
          </Link>
        </div>
      </div>
    </section>
  );
}
