import { Link } from "react-router-dom";
import { PublicLayout } from "../components/PublicLayout"; // Pastikan path benar
import { useData } from "../contexts/DataContext";
import { ArrowRight, Calendar, AlertCircle } from "lucide-react";
import { PublicRichTextRenderer } from "../components/ui/PublicRichTextRenderer";

export function PengumumanPage() {
  const { pengumuman } = useData();

  // Loading state yang disesuaikan
  if (!pengumuman) {
    return (
      <PublicLayout>
        <div className="max-w-4xl mx-auto px-4 py-20 text-center text-gray-500">
          Memuat konten...
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <div className="bg-gray-50 font-sans">
        {/* Hero Section */}
        <section className="bg-emerald-900 py-10 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-3">Pengumuman</h1>
            <p className="text-emerald-300 max-w-2xl mx-auto">
              Informasi dan pengumuman resmi Pondok Pesantren Darussalam
            </p>
          </div>
        </section>

        {/* List Section */}
        <section className="py-12 md:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {pengumuman.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-gray-500 text-lg">Belum ada pengumuman.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {pengumuman.map((item) => (
                  <Link
                    key={item.id}
                    to={`/pengumuman/${item.id}`}
                    className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all hover:-translate-y-1 group flex flex-col"
                  >
                    <div
                      className={`h-2 ${item.important ? "bg-red-500" : "bg-emerald-500"}`}
                    />
                    <div className="p-6 flex flex-col flex-1">
                      <div className="flex items-center gap-2 mb-3">
                        <Calendar size={14} className="text-gray-400" />
                        <span className="text-sm text-gray-400">
                          {new Date(item.date).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
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
                        <p className="text-gray-500 text-sm line-clamp-3 flex-1">
                          Klik untuk membaca selengkapnya.
                        </p>
                      )}
                      <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-1 text-emerald-600 text-sm font-medium group-hover:gap-2 transition-all">
                        Baca Selengkapnya <ArrowRight size={14} />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </PublicLayout>
  );
}
