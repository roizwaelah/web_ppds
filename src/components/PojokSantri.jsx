import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { stripHTML } from '../utils/text';

export function PojokSantri({ articles = [] }) {
  if (articles.length === 0) {
    return null;
  }

  return (
    <section className="py-8 md:py-8 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Pojok Santri</h2>
            <p className="text-gray-600">Tulisan dan cerita terbaru dari para santri.</p>
          </div>
          <Link
            to="/pojok-santri"
            className="hidden md:inline-flex items-center gap-1 text-emerald-600 font-medium hover:text-emerald-700"
          >
            Lihat Semua <ArrowRight size={16} />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {articles.slice(0, 6).map((article) => (
            <Link key={article.id} to={`/pojok-santri/${article.id}`} className="group">
              <div className="bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 hover:shadow-md transition-shadow h-full flex flex-col">
                <div className="aspect-video overflow-hidden">
                  {article.image ? (
                    <img
                      src={article.image}
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full bg-linear-to-br from-emerald-50 to-emerald-100 flex items-center justify-center text-emerald-700 text-sm font-medium">
                      Tanpa gambar
                    </div>
                  )}
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <span className="inline-block text-xs font-medium text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full w-fit">
                    {article.category || 'Umum'}
                  </span>
                  <h3 className="text-lg font-bold text-gray-900 mt-3 mb-2 line-clamp-2 group-hover:text-emerald-700 transition-colors">
                    {article.title}
                  </h3>
                  <p className="text-gray-500 text-sm line-clamp-2 flex-1 mb-3">
                    {article.excerpt ||
                      stripHTML(article.content).substring(0, 120) + '...'}
                  </p>
                  <div className="text-sm text-gray-400 border-t border-gray-100 pt-3 mt-auto">
                    <p className="font-medium text-gray-600">
                      {article.author}
                      {article.authorRole && (
                        <span className="font-normal text-gray-400"> - {article.authorRole}</span>
                      )}
                    </p>
                    <p className="mt-0.5">
                      {new Date(article.date).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-8 text-center md:hidden">
          <Link
            to="/pojok-santri"
            className="inline-flex items-center gap-1 text-emerald-600 font-medium"
          >
            Lihat Semua <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}

